---
name: Minara
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#3e57a8'
  on-tertiary: '#ffffff'
  tertiary-container: '#5870c3'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#dce1ff'
  tertiary-fixed-dim: '#b6c4ff'
  on-tertiary-fixed: '#00164e'
  on-tertiary-fixed-variant: '#264191'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 64px
  headline-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 48px
  headline-lg-mobile:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 36px
  body-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 28px
  label-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  caption:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  section-gap: 64px
---

## Brand & Style

The design system is engineered for a professional, Egyptian-centric educational environment. It balances the authority of established academic institutions with the accessibility of modern EdTech platforms. The visual language is **Corporate/Modern**, prioritizing clarity, focus, and trust to reduce cognitive load for learners.

The system utilizes an RTL-first architecture, ensuring that the natural flow of Arabic reading—from right to left—is respected in every interface element. The aesthetic is clean and structured, using generous whitespace to maintain a calm atmosphere during intense study sessions.

## Colors

The palette is anchored by **Teal (#0D9488)**, representing growth and professional calm. **Deep Blue (#1E3A8A)** is used for navigation and structural elements to provide a sense of institutional stability.

**Amber (#F59E0B)** serves as the high-contrast accent color reserved exclusively for Call-to-Action (CTA) elements, progress indicators, and active states. This ensures that the most critical information and actions are immediately visible against the professional teal and blue backdrop. Backgrounds should remain neutral (Slate-50 to White) to ensure high legibility of Arabic scripts.

## Typography

This design system uses **IBM Plex Sans Arabic** for all roles. It offers exceptional legibility for both technical and prose content in Arabic. 

**Key Rules:**
- **Line Height:** Arabic script requires more vertical breathing room than Latin. Maintain a minimum line height of 1.6x for body text to prevent diacritics (harakat) from clashing.
- **Font Weight:** Use SemiBold (600) for headlines to create clear distinction, as thin weights can be difficult to read in some Arabic display environments.
- **Hierarchy:** Ensure headline-to-body ratios are significant to help users scan curriculum lists and course descriptions quickly.

## Layout & Spacing

The layout is a **12-column fluid grid** that mirrors for RTL. 

**RTL Specifics:**
- The primary sidebar or navigation drawer must be anchored to the **Right**.
- Back buttons point **Right** (→) and "Forward/Next" buttons point **Left** (←).
- Page headers are right-aligned.
- Forms are right-aligned, with labels positioned above or to the right of inputs.

**Spacing Rhythm:**
Utilize an 8px base grid (documented as 4px units) for all internal spacing. Section gaps are intentionally large (64px+) to prevent the educational content from feeling overwhelming or cluttered.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Ambient Shadows**. 

- **Surface Levels:** The base background is neutral gray (Slate 50). Cards and containers use pure white (#FFFFFF) to "pop" from the background.
- **Shadows:** Use extremely soft, diffused shadows with a slight blue tint (e.g., `rgba(30, 58, 138, 0.08)`) to suggest elevation without creating visual noise.
- **Interactive States:** On hover, cards should slightly increase in shadow spread and lift (Y-axis translation) to indicate interactivity.

## Shapes

The shape language is **Rounded**, signaling a modern and friendly learning environment. 

- **Standard Cards:** 16px (rounded-xl) for main content blocks and course cards.
- **UI Elements:** 8px (rounded-lg) for input fields, buttons, and status badges.
- **Avatars & Progress:** Circular (pill-shaped) to provide a soft counterpoint to the structured grid.

## Components

### Buttons & CTAs
- **Primary:** Solid Teal (#0D9488) with white text.
- **CTA:** Solid Amber (#F59E0B) with dark navy text for high visibility.
- **Shape:** 8px corner radius. Minimum touch target of 44px height.

### Course Cards
- **Structure:** Image at top, followed by title (right-aligned), instructor name, and progress bar.
- **Shadow:** Level 1 ambient shadow.
- **Border:** 1px subtle border (#E2E8F0) to define edges against white backgrounds.

### Progress Bars
- **Style:** Height of 8px. Track color is a pale version of the primary (Teal 100).
- **Fill:** Gradient from Teal to Amber or solid Amber to indicate "active" movement.
- **Direction:** Must fill from **Right to Left**.

### Input Fields
- **Design:** Outlined style with 1px border. Label must be right-aligned above the input.
- **Focus State:** 2px Teal border with a soft teal outer glow.

### Badges & Status
- **High-Contrast:** Use semi-transparent backgrounds with highly saturated text (e.g., Light Green background with Deep Green text) for "Enrolled", "Completed", or "New" labels.