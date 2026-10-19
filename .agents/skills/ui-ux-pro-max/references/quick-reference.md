# Quick Reference — UI/UX Pro Max Full Rule Set

## 1. Accessibility (CRITICAL)
- `color-contrast` - Minimum 4.5:1 ratio for normal text (large text 3:1)
- `focus-states` - Visible focus rings on interactive elements (2–4px)
- `aria-labels` - aria-label for icon-only buttons
- `keyboard-nav` - Tab order matches visual order; full keyboard support (Enter to advance)
- `escape-routes` - Provide cancel/back in modals and multi-step flows

## 2. Touch & Interaction (CRITICAL)
- `touch-target-size` - Min 44×44px interactive controls
- `touch-spacing` - Minimum 8px gap between interactive controls
- `loading-buttons` - Disable button during async operations; show progress feedback
- `cursor-pointer` - Add cursor-pointer to all clickable elements

## 3. Style Selection (HIGH)
- `no-emoji-icons` - Use crisp vector SVG icons (Lucide), never system emojis as structural icons
- `primary-action` - Each screen should have only ONE primary CTA and one dominant question/action (Progressive Disclosure)
- `elevation-consistent` - Consistent shadow & border scale across cards and surfaces

## 4. Forms & Progressive Disclosure (CRITICAL FOR ONBOARDING)
- `one-question-per-screen` - Never overwhelm users upfront; present one focused question per screen (`What should we call you?` -> `What describes your role?` -> `How many deep-work hours/day?` -> `What are your goals?` -> `Target completion dates?`)
- `visible-labels` - Clear labels, helper text, and keyboard Enter support
