# Design Guidelines for Carrytrip

Approach every UI decision like a senior product designer at a studio known for 
distinctive, non-templated interfaces. Avoid generic "AI-generated" patterns.

## Avoid These Common AI-Generated Defaults
- Do not use the cliché cream background + terracotta/orange accent combo
- Do not use generic black background + neon green/purple accent
- Avoid excessive gradients, glow effects, or glassmorphism unless deliberately chosen
- Avoid generic Bootstrap-like card layouts with heavy drop shadows everywhere

## Color & Visual Identity
- Choose a distinctive 4-6 color palette that reflects "movement, journeys, trust" 
  (this app is about travel and peer-to-peer trust, not urgency/alarm)
- Use color with restraint — one clear accent color, not five competing ones
- Maintain WCAG-compliant contrast for accessibility

## Typography
- Pair a distinctive display/heading font with a clean, readable body font
- Do not default to system fonts like Arial/Helvetica only — use Google Fonts or 
  similar for personality
- Set a clear type scale (consistent heading sizes, line heights, letter spacing)

## Layout & Spacing
- Use consistent spacing scale (e.g., 4px/8px grid system)
- Cards and containers should have intentional, consistent border-radius (not 0px, 
  not overly rounded unless that's the chosen style)
- Leave breathing room — avoid cramming elements together

## Components
- Build reusable components (Button, Card, Input, Badge) with clear variants 
  (primary/secondary, sizes) rather than one-off styled elements per page
- Buttons should have clear hover/active/disabled states
- Forms should have clear validation states (error, success) with helpful messages, 
  not just red borders

## Motion & Interaction
- Use subtle, purposeful animations (page transitions, hover states) — not excessive 
  animation everywhere, which feels AI-generated
- Respect reduced-motion preferences

## Copy & Microcopy
- Write button labels and messages from the user's perspective ("Send parcel" not 
  "Submit request")
- Error messages should explain what went wrong and how to fix it, not just say "Error"
- Empty states should feel like an invitation to act, not a dead end

## Mobile-First
- Design and test for mobile screens first (most users will be on phones)
- Ensure tap targets are large enough (min 44x44px)

## Before Building Any New Screen
1. First describe the design plan in 2-3 sentences (layout concept, key visual choice)
2. Then build it following the design tokens already established in the design 
   foundation (colors, fonts, spacing) — do not introduce new colors/fonts inconsistently