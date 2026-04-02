# Content Wizard Load Failed Investigation

## Findings (Desktop Browser):
- Content Wizard page loads correctly on desktop
- No "Load failed" errors visible
- No console errors
- All components render properly
- Trend-Scanner IS in the sidebar (confirmed at line 58 of DashboardLayout.tsx)

## User's Screenshot (Mobile):
- Shows "Load failed" x2 at the bottom of the Content Wizard page
- Appears BELOW the "Medien" section (KI-Bild generieren, KI-Video generieren, Sofort veröffentlichen)
- The "Content generieren" button is NOT visible in the user's screenshot
- The "Load failed" appears where the Generate button should be

## Hypothesis:
- The "Load failed" is likely from the GlowCard component or the Generate button area
- Could be a mobile-specific rendering issue with framer-motion or the gradient button
- Could also be lazy-loaded components that fail on mobile network
- The emoji icons in platform buttons might cause issues on some mobile browsers
