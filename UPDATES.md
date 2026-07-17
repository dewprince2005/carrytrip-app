# Carrytrip — Project Update Log

**Project:** Carrytrip — Peer-to-Peer Delivery Matching Platform  
**Branch:** `dev`  
**Last Updated:** July 17, 2026  

---

## Overview

Carrytrip is a peer-to-peer logistics platform where **Senders** can send parcels with **Carriers** (travellers going in the same direction). This document details every major feature and fix implemented.

---

## 1. 🗺️ Map Integration — Leaflet + OpenStreetMap

### Problem
The original implementation used **Google Maps**, which requires billing to be enabled. Since billing was not enabled, the map showed an error and was unusable.

### Solution
Completely replaced Google Maps with **Leaflet** + **OpenStreetMap** (free, no API key needed).

### What was built
- **`TrackingMap` component** inside `Dashboard.jsx`:
  - Geocodes city names (e.g. "Delhi") to coordinates using the **Nominatim API** (OpenStreetMap's free geocoder).
  - Renders an interactive Leaflet map with markers for the **origin city** and **destination city**.
  - Shows a **live carrier marker** when a delivery is `in_transit`.
  - Calculates and displays a live **ETA** based on straight-line distance at 40 km/h average.
  - Has a **status stepper** (Pending → In Transit → Delivered) shown above the map.
  - Subscribes to **Supabase Realtime** on the `locations` table to update the carrier marker in real time.

---

## 2. 📡 Live GPS Tracking

### How it works (Carrier side)
- Once the **Pickup OTP** is confirmed, the carrier's browser starts sending location using `navigator.geolocation.watchPosition()`.
- Every position update **upserts** a row into the `locations` Supabase table (keyed by `booking_id`), so there is always only **one current location row** per booking — not a growing history.
- When the **Delivery OTP** is confirmed, `navigator.geolocation.clearWatch()` is called to stop tracking.
- If the carrier **denies location permission**, a clear error message explains why it is needed.

### How it works (Sender side)
- The `TrackingMap` component subscribes to Supabase Realtime changes on the `locations` table filtered by the current `booking_id`.
- Whenever the carrier sends a new location, the sender's map **automatically updates** the live marker without any page refresh.

### Database
A `locations` table is needed in Supabase with:
```sql
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id),
  carrier_id uuid references public.profiles(id),
  latitude double precision,
  longitude double precision,
  updated_at timestamptz default now()
);
```

---

## 3. 💳 Razorpay Escrow Payments

### Flow Overview
```
Booking Accepted → Sender Pays → Funds Locked in Escrow
→ Carrier Confirms Pickup OTP → Status: In Transit
→ Carrier Confirms Delivery OTP + Photo → Funds Released to Carrier
```

### Frontend Changes (`Dashboard.jsx`)
- Replaced the **mock card form** with a real **Razorpay Checkout modal**.
- The Razorpay JS SDK is loaded dynamically via a `<script>` tag (no npm install needed).
- A **Payment Breakdown card** shows:
  - Carrier base charge (weight × price/kg)
  - Carrytrip platform fee (10%)
  - Total amount the sender pays
- On successful payment, the Razorpay `handler` callback fires and calls the signature verification Edge Function.
- On failure, a clear error message with a retry option is shown.

### Backend — Supabase Edge Functions
Two Edge Functions were created in `supabase/functions/`:

#### `razorpay-create-order/index.ts`
- Receives `{ amount, receipt }` from the frontend.
- Calls the **Razorpay Orders API** using Basic Auth (`KEY_ID:SECRET_KEY`).
- Returns a Razorpay `order_id` to the frontend to open the checkout modal.
- The secret key **never touches the frontend** — it stays in Supabase secrets.

#### `razorpay-verify-signature/index.ts`
- Receives `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id }`.
- Verifies the payment signature using **HMAC SHA-256** (Web Crypto API).
- If valid, updates the booking in Supabase:
  - `payment_status` → `'held'` (Escrow Locked)
  - `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` saved for records.

### Database Migration
Run this SQL in your Supabase SQL Editor:
```sql
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_status text not null default 'pending',
ADD COLUMN IF NOT EXISTS razorpay_order_id text,
ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
ADD COLUMN IF NOT EXISTS razorpay_signature text,
ADD COLUMN IF NOT EXISTS proof_of_delivery_photo_url text;
```

### Environment Variables Required
| Variable | Where | Purpose |
|---|---|---|
| `VITE_RAZORPAY_KEY_ID` | `.env` (frontend) | Public key to open Razorpay Checkout |
| `RAZORPAY_KEY_ID` | Supabase Secrets | Used by Edge Function to call Razorpay API |
| `RAZORPAY_SECRET_KEY` | Supabase Secrets | Used by Edge Function to create orders & verify signatures |

---

## 4. 📸 Proof of Delivery — Photo Upload

### What was built
- When a carrier is confirming the **Delivery OTP**, they are now **required** to also upload a photo as proof of delivery.
- A file input (`<input type="file" accept="image/*">`) appears alongside the OTP field.
- On submit:
  1. The photo is uploaded to a **Supabase Storage bucket** named `proof_of_delivery`.
  2. The public URL is saved in `bookings.proof_of_delivery_photo_url`.
  3. The booking status updates to `delivered`.
  4. The `payment_status` updates to `released` (escrow funds released to carrier).

### Storage Setup
```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proof_of_delivery', 'proof_of_delivery', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Carriers can upload proof of delivery" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'proof_of_delivery');

CREATE POLICY "Anyone can view proof of delivery" 
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'proof_of_delivery');
```

---

## 5. 🏷️ Escrow Status Badges

Both the Sender's and Carrier's booking views now show a live **payment status badge** next to the booking status:

| Payment Status | Badge |
|---|---|
| `pending` | *(no badge, status badge handles it)* |
| `held` | 🔒 **Escrow Locked** (amber) |
| `released` | ✅ **Funds Released** (green) |

These are rendered by the `getEscrowBadge()` helper function.

---

## 6. 🐛 Bug Fixes

### `GoogleMapVisualizer is not defined` (Critical Crash)
- **Problem:** Two leftover JSX references to `<GoogleMapVisualizer />` remained in the carrier's "post route" and "my deliveries" views after Google Maps was removed. This caused the entire Dashboard to crash with a **white blank page** and **no visible error**.
- **Fix:** Replaced both references with `<TrackingMap />`.
- An **Error Boundary** (`DashboardErrorBoundary`) was added to wrap the Dashboard component so future crashes show a readable error instead of a blank page.

### Dashboard Layout — Content Not Visible
- **Problem:** The `#root` div used `min-height: 100vh` which allowed the page to grow infinitely. The sidebar and content rendered correctly but the entire page was one giant vertical block. Clicking a tab would switch state but the newly rendered content appeared below the fold (off screen).
- **Fix:** The Dashboard root container now uses `width: 100vw; height: 100dvh; overflow: hidden` making it a true full-screen layout. The sidebar scrolls independently, and the main content area scrolls independently.

### Booking Modal Scroll
- **Problem:** The "Send Carry Request" modal had so many form fields (pickup address, delivery address, weight, notes) that the "Book Transit" button was hidden below the screen edge.
- **Fix:** Added `maxHeight: '90vh'; overflowY: 'auto'` to the modal container so it becomes scrollable.

### Razorpay Key Missing
- **Problem:** `VITE_RAZORPAY_KEY_ID` was not present in the `.env` file, causing Razorpay to throw "Authentication key was missing during initialization".
- **Fix:** Added `VITE_RAZORPAY_KEY_ID` to the `.env` file.

---

## 7. 📁 New Files Created

| File | Description |
|---|---|
| `supabase/functions/razorpay-create-order/index.ts` | Edge Function: Creates a Razorpay order securely on the backend |
| `supabase/functions/razorpay-verify-signature/index.ts` | Edge Function: Verifies Razorpay payment signature using HMAC SHA-256 |
| `src/pages/RouteSearch.jsx` | Dedicated page for searching carrier routes |
| `src/pages/RouteResults.jsx` | Dedicated page showing filtered route results |

---

## 8. 📦 Dependencies Added

| Package | Why |
|---|---|
| `leaflet` | Open-source interactive maps (replaced Google Maps) |
| `react-leaflet` | React wrapper for Leaflet maps |

---

## 9. 🔐 Security Notes

- The Razorpay **Secret Key** is **never exposed to the frontend**. It only lives in Supabase Secrets (`RAZORPAY_SECRET_KEY`) and is accessed only inside the Edge Functions running on Supabase's servers.
- The `.env` file (containing `VITE_RAZORPAY_KEY_ID`) is listed in `.gitignore` and was **not pushed to GitHub**.
- Payment signature verification happens **server-side** in the Edge Function, preventing spoofed payment confirmations.

---

## 10. 🧪 How to Test End-to-End

1. **Sender** → Find a carrier route → Send a Carry Request → Fill in details → Book Transit.
2. **Carrier** → Log in → Delivery Jobs → Accept the booking request.
3. **Sender** → My Sent Parcels → Click "Secure Escrow Payment" → Pay using Razorpay test card `4111 1111 1111 1111`, expiry `12/28`, CVV `123`.
4. **Sender** shares the **Pickup OTP** with the carrier.
5. **Carrier** → Delivery Jobs → Enter Pickup OTP → Confirm Pickup → Status becomes "In Transit".
6. **Sender** → Map shows carrier's live location updating in real time.
7. **Sender** shares the **Delivery OTP** with the carrier at drop-off.
8. **Carrier** → Enter Delivery OTP + Upload a photo → Confirm Drop-off → Escrow funds released.
9. Both parties see status: **Delivered** + badge: **Funds Released** ✅.
