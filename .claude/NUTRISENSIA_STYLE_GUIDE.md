# NutriSensia Complete Style Guide

## 1. Overview

### Brand Identity

NutriSensia is a Swiss-based personalized nutrition platform that combines clinical excellence with a warm, approachable design aesthetic. The design system balances professionalism with accessibility, creating a trustworthy yet inviting experience for patients and nutritionists.

### Design Philosophy

- **Natural & Organic**: Uses earth tones, sage greens, and natural color palettes to evoke health and wellness
- **Clean & Modern**: Minimalist approach with generous white space and clear typography hierarchies
- **Professional yet Approachable**: Serif headings (Marcellus) paired with clean sans-serif body text (Plus Jakarta Sans)
- **Elevated Simplicity**: Subtle shadows, soft borders, and gentle transitions create depth without complexity
- **Trust & Credibility**: Consistent use of borders, structured layouts, and clear visual hierarchy

### Visual Approach

The design follows a "health-forward" aesthetic with:

- Soft, muted color palettes inspired by nature
- Generous spacing and breathing room
- Card-based layouts with distinctive shadow patterns
- Subtle animations and hover states
- Clear visual separation between sections

---

## 2. Color Palette

### Primary Colors

#### Green Tones (Brand Identity)

```css
--primary-green: #4A6B5C;        /* Main brand green */
--primary-green-dark: #3A5B4C;   /* Dark variant for hover states */
#3f6655;                         /* Section headings, primary CTAs */
#2f5645;                         /* Button hover states */
#2d5042;                         /* Darker button hover */
#20332b;                         /* Very dark green for text on light backgrounds */
```

**Usage**: Primary navigation, headings, buttons, section dividers, brand elements

#### Sage & Muted Greens (Supporting Palette)

```css
--sage-light: #C8D5C8;          /* Light sage accents */
--sage-lighter: #E8F3EF;        /* Background tints, card backgrounds */
#b6ccae;                        /* Button backgrounds, section backgrounds */
#b6ccae26;                      /* 15% opacity - card backgrounds */
#a6bc9e;                        /* Button hover state */
#b2c2bb;                        /* Border accents, dividers */
#E5DED6;                        /* Shadow color - Beige Sand for distinctive card shadows */
#b8d4c7;                        /* SVG fills, decorative elements */
#4A9B7B;                        /* Accent green for icons */
#2E7D5E;                        /* Deep green for important elements */
```

**Usage**: Backgrounds, borders, subtle accents, illustrations, card shadows

### Secondary Colors

#### Purple Accents

```css
#9461bc;                        /* Top bar background, testimonial quotes */
--purple-accent: #7B68B8;       /* Accent elements */
```

**Usage**: Top announcement bar, testimonial section accents, special callouts

#### Blue Accents

```css
#5e69bd;                        /* CTA banner background */
#b4cafa;                        /* Newsletter button - patient variant */
```

**Usage**: High-visibility CTA banners, newsletter signup buttons

### Neutral Colors

#### Backgrounds

```css
--cream: #FAFBFC;               /* Off-white, subtle background */
--beige-light: #F5F1EC;         /* Warm beige background */
#f8f7ef;                        /* Primary section background */
#ffffff;                        /* Pure white for cards */
--white: #ffffff;               /* Standard white */
#e5e8e0;                        /* Award card backgrounds */
```

**Usage**: Section backgrounds, card backgrounds, alternating section colors

#### Text Colors

```css
--text-dark: #2D3748;           /* Primary dark text */
--text-gray: #4A5568;           /* Secondary text */
#41556b;                        /* Body text, descriptions, paragraphs */
#3f6655;                        /* Heading text (matches primary green) */
#fff / #ffffff;                 /* White text on dark backgrounds */
```

**Usage**: All text elements based on hierarchy and background

#### Border Colors

```css
--border-color: #E2E8F0;        /* Default borders */
#e5e5e5;                        /* Soft gray borders on cards (NEW STANDARD) */
#3f6655;                        /* Strong borders (legacy/special cases) */
#b6ccae;                        /* Soft borders on FAQ items */
#41556b;                        /* Table borders */
#b2c2bb;                        /* Underline accents */
```

**Usage**: Card borders (#e5e5e5 for all standard cards), section dividers, table borders, decorative underlines

### Decorative & Special Colors

```css
rgba(255, 255, 255, 0.85);      /* Hero card overlay background */
rgba(255, 255, 255, 0.1);       /* Subtle overlays on dark backgrounds */
rgba(255, 255, 255, 0.2);       /* Social icon backgrounds, borders on dark sections */
rgba(255, 255, 255, 0.3);       /* Social icon hover states */
rgba(86, 120, 105, 0.15-0.4);   /* Decorative circles on award section */
rgba(0, 0, 0, 0.05-0.1);        /* Shadow overlays */
```

**Usage**: Overlays, translucent backgrounds, decorative elements

### Gradient Backgrounds

```css
/* Dégradé CTA Principal - STANDARD pour tous les boutons */
linear-gradient(135deg, #1B998B 0%, #147569 100%);  /* CTA buttons, announcement bars */

/* Dégradé CTA Hover */
linear-gradient(135deg, #147569 0%, #0f5a50 100%);  /* CTA buttons hover state */

/* Dégradé Section */
linear-gradient(180deg, #f5f1ec 0%, #ffffff 100%);  /* Testimonial section */
```

**Usage**:

- **CTA Gradient (135deg)**: Tous les boutons d'action principaux, barres d'annonce
- **Section Gradient (180deg)**: Transitions subtiles entre sections, arrière-plans testimonials

---

## 3. Typography

### Font Families

#### Serif - Marcellus (Headings & Display)

```css
font-family: 'Marcellus', serif;
```

**Purpose**: All headings (h1, h2, h3), section titles, emphasis elements
**Character**: Elegant, sophisticated, trustworthy
**Loaded from**: Google Fonts

#### Sans-Serif - Plus Jakarta Sans (Body & UI)

```css
font-family:
  'Plus Jakarta Sans',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;
```

**Purpose**: Body text, buttons, navigation, all UI elements
**Character**: Clean, modern, highly legible
**Weights used**: 400 (regular), 500, 600 (semi-bold), 700 (bold)
**Loaded from**: Google Fonts

#### System Fallback Stack

```css
--font-primary:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue',
  Arial, sans-serif;
```

### Font Sizes & Line Heights

#### CSS Variables (Base System)

```css
--font-size-base: 16px; /* Base body text */
--font-size-sm: 14px; /* Small text, captions */
--font-size-lg: 18px; /* Large body text */
--font-size-xl: 24px; /* Subheadings */
--font-size-2xl: 32px; /* Large headings */
--font-size-3xl: 42px; /* Hero headings */

--line-height-base: 1.6; /* Standard body text */
--line-height-tight: 1.2; /* Headings */
```

### Heading Styles (Marcellus)

#### H1 - Hero & Page Titles

```css
h1 {
  color: #3f6655;
  font-family: 'Marcellus', serif;
  font-size: 48px;
  line-height: 57.6px;
  text-align: left;
  font-weight: 700; /* IMPORTANT: All main titles are bold */
}
```

**Usage**: Hero section titles, page main headings

#### H2 - Main Section Titles

```css
h2 {
  color: #3f6655;
  font-family: 'Marcellus', serif;
  font-size: 48px;
  line-height: 57.6px;
  text-align: center;
  font-weight: 700; /* IMPORTANT: All section titles are bold */
}
```

**Variants**:

- `.trust-title`: 50px / 60px line-height
- `.insurance-title`: 45px / 54px line-height
- `.hero h2`: 42px / 54.6px line-height
- `.section-title`: 48px / 57.6px line-height or 50px / 60px

**Usage**: Primary section headings throughout the site

#### H3 - Subsection Titles

```css
h3 {
  color: #3f6655;
  font-family: 'Marcellus', serif;
  font-size: 28px;
  line-height: 36px;
  text-align: center;
  font-weight: 700; /* Bold for consistency */
}
```

**Variants**:

- `.how-it-works-title`: 37px / 44.4px line-height (left-aligned)
- Footer h3: 18px / 27px, weight: 700, Plus Jakarta Sans (exception to serif rule)

**Usage**: Card titles, subsection headings, secondary emphasis

### Body Text Styles (Plus Jakarta Sans)

#### P - Standard Paragraphs

```css
p {
  color: #41556b;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
}
```

**Variants**:

- `.hero-subtitle`: 24px / 26.4px, color: #3f6655
- `.hero-testimonial`: 14px / 28px
- `.how-it-works-description`: 18px / 20.8px, left-aligned
- `.section-subtitle`: 16px / 24px
- `.how-it-works-subtitle`: 20px / 26px
- `.trust-label`: 20px / 30px, white text
- Footer text: 14px / 18.2px

**Usage**: All body content, descriptions, testimonials

### Special Text Styles

#### Trust Section Numbers

```css
.trust-number {
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 45px;
  font-weight: 700;
  line-height: 54px;
  text-align: center;
}
```

#### Process Step Titles

```css
.process-step-title {
  color: #3f6655;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 26px;
  font-weight: 700;
  line-height: 31.2px;
  text-align: left;
  border-bottom: 1px solid #b2c2bb;
  padding-bottom: 8px;
}
```

#### CTA Text

```css
.how-it-works-cta {
  color: #3f6655;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 18px;
  line-height: 28px;
  font-weight: 700;
}
```

#### Award/Commitment Titles

```css
.commitment-title {
  color: #3f6655;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 22px;
  font-weight: 700;
  line-height: 24.2px;
}
```

#### Table Headers

```css
.results-table-header th {
  color: #3f6655;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 38.4px;
}
```

#### Navigation Links

```css
.nav-menu a {
  color: #41556b;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 25.2px;
}
```

### Typography Combinations

#### Hero Section Pattern

- **Title**: Marcellus, 48px / 57.6px, #3f6655, weight: 700 (bold)
- **Subtitle**: Plus Jakarta Sans, 24px / 26.4px, #3f6655, weight: 400
- **Body**: Plus Jakarta Sans, 14px / 28px, #41556b, weight: 400

#### Section Header Pattern

- **Title**: Marcellus, 48px / 57.6px, #3f6655, weight: 700 (bold)
- **Subtitle**: Plus Jakarta Sans, 16-20px / 24-26px, #41556b, weight: 400

#### Card Pattern

- **Title**: Marcellus, 24-28px, #1a1a1a, weight: 400 (regular) — **IMPORTANT: Blog/article card titles are NOT bold**
- **Section Titles**: Marcellus, 48px, #3f6655, weight: 700 (bold) — **Main page section titles remain bold**
- **Subtitle**: Plus Jakarta Sans, 16px, #3f6655, italic, with underline accent (border-bottom: 1px solid #b2c2bb)
- **Body**: Plus Jakarta Sans, 15-16px / 22-24px, #41556b, weight: 400

---

## 4. Spacing System

### CSS Variables

```css
--spacing-xs: 0.5rem; /* 8px - tight spacing */
--spacing-sm: 1rem; /* 16px - small spacing */
--spacing-md: 1.5rem; /* 24px - medium spacing */
--spacing-lg: 2rem; /* 32px - large spacing */
--spacing-xl: 3rem; /* 48px - extra large */
--spacing-2xl: 4rem; /* 64px - double extra large */
--spacing-3xl: 6rem; /* 96px - triple extra large */
```

### Common Spacing Values

#### Section Padding

```css
/* Standard section padding */
padding: 80px 0; /* Most sections */
padding: var(--spacing-3xl) 0; /* Large sections (96px) */
padding: var(--spacing-2xl) 0; /* Medium sections (64px) */
padding: 1.68rem 0; /* CTA banner specific */
```

#### Card & Component Padding

```css
padding: 48px; /* Hero card */
padding: 60px; /* How it works card */
padding: var(--spacing-xl); /* Generic cards (48px) */
padding: var(--spacing-lg); /* Medium cards (32px) */
padding: 20px 24px; /* Award cards */
padding: 32px 24px; /* Table headers */
padding: 40px 32px; /* Table body cells */
```

#### Button Padding

```css
padding: 12px 28px; /* Standard button */
padding: 12px 24px; /* Primary button variant */
padding: 14px 32px; /* Large button */
padding: 16px 40px; /* Extra large button */
```

#### Margins & Gaps

**Vertical Spacing**:

```css
margin-bottom: 12px; /* Small gap */
margin-bottom: 20px; /* Medium gap */
margin-bottom: 24px; /* Standard gap */
margin-bottom: 32px; /* Large gap */
margin-bottom: 41px; /* Trust title specific */
margin-bottom: 48px; /* Section element gap */
margin-bottom: 64px; /* Large section gap */
```

**Grid & Flex Gaps**:

```css
gap: var(--spacing-xs); /* 8px - tight grid */
gap: var(--spacing-md); /* 24px - social links */
gap: var(--spacing-lg); /* 32px - standard grid */
gap: var(--spacing-xl); /* 48px - large grid */
gap: 12px; /* Nav actions */
gap: 16px; /* Award grid, card elements */
gap: 60px; /* How it works layout */
```

#### Container Widths

```css
max-width: 1200px; /* Standard container */
max-width: 1400px; /* Wide container */
max-width: 800px; /* Narrow content (how-it-works-subtitle) */
max-width: 900px; /* Medium content (testimonials, results) */
max-width: 1000px; /* Trust stats, section subtitles */
max-width: 700px; /* Award grid */
max-width: 240px; /* How it works step */
```

#### Specific Component Spacing

```css
/* Top bar */
padding: var(--spacing-xs) 0; /* 8px vertical */

/* Header */
padding: var(--spacing-md) 0; /* 24px vertical */

/* Hero card shadow offset */
box-shadow: 8px 8px 0 #e5ded6; /* 8px right, 8px down */

/* Process step underline */
padding-bottom: 8px;
margin-bottom: 12px;

/* Footer column heading */
margin-bottom: 12px;
margin-top: 30px; /* Between groups */

/* Border top spacing */
padding-top: var(--spacing-lg); /* Footer bottom */
```

---

## 5. Component Styles

### Buttons

#### Base Button Style

```css
.btn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 35px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 25.2px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}
```

#### Button Variants

**Primary Button**:

```css
.btn-primary {
  background-color: #3f6655;
  color: #fff;
  border: none;
}
.btn-primary:hover {
  background-color: #2f5645;
}
```

**Secondary Button**:

```css
.btn-secondary {
  background-color: #fff;
  color: var(--primary-green);
  border: 2px solid var(--primary-green);
}
.btn-secondary:hover {
  background-color: var(--sage-lighter);
}
```

**Light Button**:

```css
.btn-light {
  background-color: #b6ccae;
  color: #41556b;
}
.btn-light:hover {
  background-color: #a6bc9e;
}
```

**Hero Button**:

```css
.hero-btn {
  background-color: #3f6655;
  color: #f8f7ef;
  padding: 12px 24px;
  border-radius: 35px;
  font-size: 14px;
  font-weight: 600;
  line-height: 25.2px;
}
.hero-btn:hover {
  background-color: #2d5042;
}
```

**Insurance Button**:

```css
.insurance-btn {
  background-color: #f8f7ef;
  color: #20332b;
  padding: 14px 32px;
  border-radius: 35px;
  border: 1px solid #20332b;
  font-size: 16px;
  font-weight: 600;
  line-height: 16px;
}
.insurance-btn:hover {
  background-color: #20332b;
  color: #f8f7ef;
}
```

**Award Button**:

```css
.award-btn {
  background-color: #b6ccae;
  color: #3f6655;
  padding: 16px 40px;
  border-radius: 35px;
  font-weight: 700;
  line-height: 28.8px;
}
```

**Newsletter Buttons**:

```css
/* Patient Newsletter */
.btn-newsletter-patient {
  background-color: #b4cafa;
  color: #3f6655;
  padding: 16px 40px;
  border-radius: 35px;
  font-size: 14px;
  font-weight: 700;
  line-height: 25.2px;
}

/* Provider Newsletter */
.btn-newsletter-provider {
  background-color: #fff;
  color: #3f6655;
  padding: 16px 40px;
  border-radius: 35px;
  font-size: 14px;
  font-weight: 700;
  line-height: 25.2px;
}
```

### Cards

#### Base Card Pattern

The signature NutriSensia card has:

- Border: 1px solid #e5e5e5 (soft gray - NEW STANDARD)
- Border-radius: 10px (some variants use 20px)
- Box-shadow: 8px 8px 0 #E5DED6 (offset shadow)
- Background: #fff or #b6ccae26 (15% opacity green)

**Design Note**: The border color was updated from #3f6655 (green) to #e5e5e5 (soft gray) for a more subtle, refined look that maintains visual hierarchy while reducing visual weight.

#### Hero Card

```css
.hero-card {
  background-color: rgba(255, 255, 255, 0.85);
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  padding: 48px;
  box-shadow: 8px 8px 0 #e5ded6;
}
```

#### How It Works Card

```css
.how-it-works-left {
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  padding: 60px;
  box-shadow: 8px 8px 0 #e5ded6;
}
```

#### Condition Cards

```css
.condition-card {
  background-color: #b6ccae26;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: var(--spacing-xl);
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 8px 8px 0 #e5ded6;
}
.condition-card:hover {
  transform: translateY(-4px);
  box-shadow: 10px 10px 0 #e5ded6;
  /* Border stays 1px on hover */
}
```

#### Commitment Cards

```css
.commitment-card {
  background-color: #b6ccae26;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: var(--spacing-xl);
  text-align: center;
  box-shadow: 8px 8px 0 #e5ded6;
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

#### Award Cards

```css
.award-card {
  background-color: #e5e8e0;
  border-radius: 10px;
  padding: 20px 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  height: 80px;
}
```

#### Blog Cards (NutriSensia Style)

```css
.blog-card {
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 8px 8px 0 #e5ded6;
  transition:
    transform 0.3s ease-out,
    box-shadow 0.3s ease-out;
}
.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 10px 10px 0 #e5ded6;
}

/* Card Titles - Non-bold */
.blog-card-title {
  font-family: 'Marcellus', serif;
  font-size: 24px;
  font-weight: 400; /* Regular, not bold */
  line-height: 1.4;
  color: #1a1a1a;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e5e5e5;
}
```

#### Blog Article Cards (Finary-Inspired)

**Featured Article Card** - Large vertical card with image on top:

```css
.featured-card {
  display: block;
  height: 100%;
}

.featured-card-image {
  aspect-ratio: 4/3;
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  background-color: #e8f3ef;
  margin-bottom: 16px;
  position: relative;
}

.featured-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.featured-card:hover img {
  transform: scale(1.05);
}

/* Green overlay on images */
.featured-card-image-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(63, 102, 85, 0.4);
  pointer-events: none;
  transition: opacity 0.3s;
}

.featured-card-category {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 6px;
  background-color: #f5f5f5;
  color: #1a1a1a;
  border: 1px solid #e5e5e5;
  display: inline-block;
  margin-bottom: 12px;
}

.featured-card-title {
  font-family: 'Marcellus', serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: #1a1a1a;
  margin-bottom: 12px;
  transition: color 0.2s;
}

.featured-card:hover .featured-card-title {
  color: #2f5645;
}

.featured-card-meta {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px;
  color: #666666;
}

.featured-card-meta .author {
  font-weight: 500;
  color: #1a1a1a;
}
```

**Trend Article Card** - Horizontal compact card:

```css
.trend-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.trend-card-image {
  width: 160px;
  height: 96px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 12px;
  background-color: #e8f3ef;
  position: relative;
}

.trend-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.trend-card:hover img {
  transform: scale(1.05);
}

/* Green overlay on images */
.trend-card-image-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(63, 102, 85, 0.4);
  pointer-events: none;
  transition: opacity 0.3s;
}

.trend-card-content {
  flex: 1;
  padding-top: 4px;
}

.trend-card-category {
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 6px;
  background-color: #f5f5f5;
  color: #1a1a1a;
  border: 1px solid #e5e5e5;
  display: inline-block;
  margin-bottom: 8px;
}

.trend-card-title {
  font-family: 'Marcellus', serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  color: #1a1a1a;
  margin-bottom: 8px;
  transition: color 0.2s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.trend-card:hover .trend-card-title {
  color: #3f6655;
}

.trend-card-meta {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px;
  color: #666666;
}

.trend-card-meta .author {
  font-weight: 500;
  color: #1a1a1a;
}
```

**Design Characteristics**:

- **Image Overlay**: rgba(63, 102, 85, 0.4) green tint on all article images
- **Rounded Corners**: 16px for featured cards, 12px for trend cards
- **Typography**: Marcellus for titles, Plus Jakarta Sans for metadata
- **Hover Effects**: Scale(1.05) on images, color change on titles
- **Category Badges**: Neutral gray (#f5f5f5) with subtle border
- **Clean Layout**: No signature shadow - follows Finary's minimalist approach

### Navigation

#### Top Bar

```css
.top-bar {
  background-color: #9461bc;
  color: #fff;
  padding: var(--spacing-xs) 0;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  line-height: 18.2px;
}
```

#### Header

```css
.header {
  background-color: #f8f7ef;
  border-bottom: 1px solid var(--border-color);
  padding: var(--spacing-md) 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}
```

#### Logo

```css
.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-green);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background-color: var(--primary-green);
  border-radius: 50%;
}
```

#### Navigation Menu

```css
.nav-menu {
  display: flex;
  list-style: none;
  gap: var(--spacing-lg);
  align-items: center;
}

.nav-menu a {
  color: #41556b;
  font-size: 14px;
  font-weight: 600;
  line-height: 25.2px;
  transition: color 0.3s;
}
.nav-menu a:hover {
  color: var(--primary-green);
}
```

### Forms & Inputs

#### FAQ Items (Accordion Pattern)

```css
.faq-item {
  border: 1px solid #b6ccae;
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  border-radius: 8px;
}

.faq-question {
  font-weight: 600;
  font-size: var(--font-size-lg);
  color: var(--text-dark);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-answer {
  display: none;
  padding-top: var(--spacing-md);
  color: #41556b;
  line-height: 24px;
}
```

### Tables

#### Results Table

```css
.results-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 10px;
}

.results-table-header {
  background-color: #e5e8e0;
  border: 1px solid #3f6655;
  border-radius: 10px 10px 0px 0px;
}

.results-table-header th {
  padding: 32px 24px;
  color: #3f6655;
  font-size: 32px;
  font-weight: 700;
  line-height: 38.4px;
}

.results-table-body {
  background-color: #fff;
  border-left: 1px solid #41556b;
  border-right: 1px solid #41556b;
  border-bottom: 1px solid #41556b;
  border-radius: 0px 0px 10px 10px;
}

.results-table-body td {
  padding: 40px 32px;
  color: #41556b;
  font-size: 18px;
  line-height: 27px;
  border-right: 1px solid #41556b;
}
```

#### Stat Badges

```css
.results-stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #e5e8e0;
  padding: 6px 12px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
}
.results-stat-badge::before {
  content: '↑';
  font-size: 16px;
  font-weight: 700;
}
```

### Footer

```css
.footer {
  background-color: #3f6655;
  color: #fff;
  padding: var(--spacing-3xl) 0 var(--spacing-lg);
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xl);
}

.footer-column h3 {
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 27px;
  margin-bottom: 12px;
  margin-top: 30px;
}

.footer-links a {
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  line-height: 30.4px;
  transition: color 0.3s;
}
.footer-links a:hover {
  text-decoration: underline;
}
```

### Social Icons

```css
.social-icon {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}
.social-icon:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
```

---

## 6. Shadows & Elevation

### CSS Variables

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-card: 0 2px 8px rgba(74, 107, 92, 0.08);
```

### Signature Shadow Pattern

The most distinctive shadow in NutriSensia:

```css
box-shadow: 8px 8px 0 #e5ded6;
```

**Usage**: Hero cards, how-it-works cards, condition cards, commitment cards, blog cards

**Characteristics**:

- **Offset Shadow**: 8px right, 8px down
- **No blur**: 0 blur radius (hard-edge shadow)
- **Color**: #E5DED6 (Beige Sand)
- **Creates**: Layered, paper-cut aesthetic

### Component-Specific Shadows

**Scroll Top Button**:

```css
box-shadow: var(--shadow-lg);
/* 0 10px 15px -3px rgba(0, 0, 0, 0.1) */
```

**Standard Card Shadow** (if not using offset):

```css
box-shadow: var(--shadow-card);
/* 0 2px 8px rgba(74, 107, 92, 0.08) */
```

### Elevation Levels

1. **Level 0** (Flat): No shadow - backgrounds, section dividers
2. **Level 1** (Subtle): `var(--shadow-sm)` - subtle separation
3. **Level 2** (Moderate): `var(--shadow-card)` - cards, panels
4. **Level 3** (Elevated): `8px 8px 0 #E5DED6` - primary cards (SIGNATURE)
5. **Level 4** (Floating): `var(--shadow-lg)` - modals, floating buttons

---

## 7. Animations & Transitions

### Transition Properties

#### Standard Transition

```css
transition: all 0.3s ease;
```

**Usage**: Buttons, links, cards, most interactive elements

#### Specific Property Transitions

```css
transition: color 0.3s; /* Links, text */
transition: background-color 0.3s; /* Social icons */
```

### Hover States

#### Button Hover

```css
/* Background color change */
.btn-primary:hover {
  background-color: #2f5645; /* Darker green */
}

/* Background + color swap */
.insurance-btn:hover {
  background-color: #20332b;
  color: #f8f7ef;
}
```

#### Card Hover

```css
.condition-card:hover,
.blog-card:hover {
  transform: translateY(-2px) translateX(-2px);
  border-width: 2px; /* Border thickens from 1px to 2px */
  /* Shadow stays at: 8px 8px 0 #E5DED6 */
}
```

**Effect**: Card lifts up and to the left slightly, border becomes bolder

#### Link Hover

```css
.nav-menu a:hover {
  color: var(--primary-green);
}

.footer-links a:hover {
  text-decoration: underline;
}

.results-cta-link:hover {
  text-decoration: underline;
}
```

#### Social Icon Hover

```css
.social-icon:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
```

#### Scroll Top Button Hover

```css
.scroll-top:hover {
  background-color: var(--primary-green-dark);
  transform: translateY(-3px);
}
```

#### Testimonial Arrow Hover

```css
.testimonial-arrow:hover {
  color: var(--primary-green);
}
```

### Scroll Behavior

```css
html {
  scroll-behavior: smooth;
}
```

### Scroll Top Button Animation

```css
.scroll-top {
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}
.scroll-top.visible {
  opacity: 1;
  visibility: visible;
}
```

**Trigger**: Appears when scrolled > 300px from top

### FAQ Accordion Animation

```javascript
// JavaScript-based toggle
answer.style.display = 'block' | 'none';
toggle.textContent = '∧' | '∨';
```

---

## 8. Border Radius

### Radius Values

#### Buttons

```css
border-radius: 35px;
```

**Usage**: All buttons - creates pill-shaped buttons

#### Cards

```css
border-radius: 10px; /* Standard cards */
border-radius: 16px; /* Blog cards */
border-radius: 20px; /* Hero card, how-it-works card */
```

#### Tables

```css
border-radius: 10px; /* Overall table */
border-radius: 10px 10px 0px 0px; /* Table header only */
border-radius: 0px 0px 10px 10px; /* Table body only */
/* Individual corner rounding */
border-top-left-radius: 10px;
border-top-right-radius: 10px;
border-bottom-left-radius: 10px;
border-bottom-right-radius: 10px;
```

#### Small Elements

```css
border-radius: 4px; /* Stat badges */
border-radius: 6px; /* Small badges */
border-radius: 8px; /* FAQ items */
```

#### Circular Elements

```css
border-radius: 50%;
```

**Usage**: Logo icon, social icons, condition icons, commitment icons

---

## 9. Opacity & Transparency

### Background Overlays

```css
rgba(255, 255, 255, 0.85);          /* Hero card overlay */
rgba(255, 255, 255, 0.1);           /* Results section card overlay */
rgba(255, 255, 255, 0.2);           /* Social icons, table borders */
rgba(255, 255, 255, 0.3);           /* Social icon hover */
```

### Decorative Elements

**Award Section Circles**:

```css
rgba(86, 120, 105, 0.15);           /* Lightest circles */
rgba(86, 120, 105, 0.2);            /* Light circles */
rgba(86, 120, 105, 0.25);           /* Medium circles */
rgba(86, 120, 105, 0.3);            /* Medium-dark circles */
rgba(86, 120, 105, 0.35);           /* Dark circles */
rgba(86, 120, 105, 0.4);            /* Darkest circles */
```

### Background Tints

```css
#b6ccae26;                          /* Card backgrounds (15% opacity) */
```

**Note**: This is hex with alpha channel - equivalent to rgba(182, 204, 174, 0.15)

### Shadow Opacity

```css
rgba(0, 0, 0, 0.05);                /* Very light shadow */
rgba(0, 0, 0, 0.1);                 /* Standard shadow */
rgba(74, 107, 92, 0.08);            /* Card shadow with green tint */
```

### Background Images

```css
opacity: 0.05;
```

**Usage**: Decorative logo watermark in Our Results section

---

## 10. Layout Patterns

### Container System

#### Standard Container

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md); /* 0 24px */
}
```

#### Wide Container

```css
.container-wide {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}
```

### Grid Systems

#### 4-Column Grid (Trust Stats, Footer)

```css
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: var(--spacing-lg); /* 32px */
```

#### 3-Column Grid (Conditions, Commitment, Blog)

```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: var(--spacing-lg); /* 32px */
gap: var(--spacing-xl); /* 48px for commitment */
```

#### 2-Column Grid (Results Table Cells)

```css
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: var(--spacing-lg);
```

#### Custom Grid (How It Works)

```css
display: grid;
grid-template-columns: 1.95fr 1fr; /* 66% / 34% split */
gap: 60px;
```

#### Custom Grid (Nutrition Care)

```css
display: grid;
grid-template-columns: 1fr 1fr; /* 50/50 split */
gap: var(--spacing-3xl); /* 96px */
```

### Flexbox Patterns

#### Header Navigation

```css
display: flex;
justify-content: space-between;
align-items: center;
```

#### Navigation Menu

```css
display: flex;
list-style: none;
gap: var(--spacing-lg);
align-items: center;
flex-wrap: nowrap;
```

#### How It Works Steps

```css
display: flex;
align-items: flex-start;
justify-content: center;
gap: 32px;
```

#### CTA Banner

```css
display: flex;
justify-content: center;
align-items: center;
gap: var(--spacing-lg);
```

#### Award Card

```css
display: flex;
flex-direction: row;
align-items: center;
justify-content: flex-start;
gap: 16px;
```

#### Commitment Card

```css
display: flex;
flex-direction: column;
align-items: center;
justify-content: space-between;
```

### Positioning Patterns

#### Sticky Header

```css
position: sticky;
top: 0;
z-index: 1000;
```

#### Absolute Positioning (Hero)

```css
.hero-content {
  position: absolute;
  left: 175px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 40.25%;
}
```

#### Fixed Positioning (Scroll Top Button)

```css
position: fixed;
bottom: var(--spacing-lg);
right: var(--spacing-lg);
```

#### Relative Positioning with Absolute Children

```css
/* Parent */
position: relative;
overflow: hidden;

/* Child - Decorative Background */
.award-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}
```

### Responsive Breakpoints

#### Large Tablets (≤ 1024px)

```css
@media (max-width: 1024px) {
  /* 4-col → 2-col */
  grid-template-columns: repeat(2, 1fr);

  /* 3-col → 2-col */
  grid-template-columns: repeat(2, 1fr);

  /* Split layout → Stacked */
  grid-template-columns: 1fr;
}
```

#### Mobile (≤ 768px)

```css
@media (max-width: 768px) {
  /* Hide navigation menu */
  .nav-menu {
    display: none;
  }

  /* All grids → Single column */
  grid-template-columns: 1fr;

  /* Hide arrows */
  .step-arrow {
    display: none;
  }
}
```

---

## 11. Common CSS Patterns

### CSS Reset

```css
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

### Base HTML & Body

```css
html {
  font-size: var(--font-size-base);
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-primary);
  color: var(--text-dark);
  line-height: var(--line-height-base);
  background-color: var(--white);
  overflow-x: hidden;
}
```

### Image Defaults

```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

### Link Defaults

```css
a {
  text-decoration: none;
  color: inherit;
}
```

### Underline Accent Pattern

```css
.hero-subtitle,
.process-step-title {
  border-bottom: 1px solid #b2c2bb;
  padding-bottom: 8px;
  display: inline-block;
}
```

### Icon Container Pattern

```css
.condition-icon,
.commitment-icon {
  width: 60px-80px;
  height: 60px-80px;
  margin: 0 auto var(--spacing-md);
  background-color: var(--white) | var(--sage-lighter);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Section Separator

```css
.section-separator {
  height: 4px;
  background-color: #b2c2bb;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
```

### Background Image with Overlay Pattern

```css
/* Background watermark */
.our-results-section::before {
  content: '';
  position: absolute;
  top: 0;
  right: -190px;
  bottom: 0;
  width: 600px;
  background-image: url('...');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center right;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
```

### Radial Gradient Decorative Circles

```css
background-image:
  radial-gradient(
    circle at 85% 10%,
    rgba(86, 120, 105, 0.25) 0%,
    rgba(86, 120, 105, 0.25) 180px,
    transparent 180px
  ),
  radial-gradient(
    circle at 15% 50%,
    rgba(86, 120, 105, 0.2) 0%,
    rgba(86, 120, 105, 0.2) 220px,
    transparent 220px
  );
/* ... multiple layers ... */
```

**Usage**: Award section background decoration

### List Styling

```css
list-style: none; /* Remove default */
list-style: disc; /* Bullet points */

/* Custom bullet positioning */
li {
  display: list-item;
  margin: 0px 0px 0px 16px;
  padding: 0px 0px 0px 1.6px;
}
```

---

## 12. Example Component Code

### Example 1: Hero Section

```html
<section class="hero">
  <div class="hero-container">
    <div class="hero-content">
      <div class="hero-card">
        <h2>Best-in-Class Virtual Nutrition Care, Covered by Insurance.</h2>
        <p class="hero-subtitle">
          Meet online with a registered dietitian (RD) who understands you.
        </p>
        <p class="hero-testimonial">
          "My RD listens, advises, and encourages me to continue with my health
          journey. I highly recommend Culina Health for lifelong lifestyle
          changes." - Eli A.
        </p>
        <div>
          <a href="#" class="hero-btn">Get Started →</a>
        </div>
      </div>
    </div>
    <div class="hero-image">
      <!-- Background image set via CSS -->
    </div>
  </div>
</section>
```

```css
.hero {
  background-color: #ffffff;
  padding: 0;
  min-height: 580px;
  display: flex;
  align-items: stretch;
}

.hero-container {
  display: flex;
  width: 100%;
  position: relative;
  min-height: 580px;
}

.hero-content {
  position: absolute;
  left: 175px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 40.25%;
}

.hero-card {
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  padding: 48px;
  box-shadow: 8px 8px 0 #e5ded6;
}

.hero h2 {
  color: #3f6655;
  font-family: 'Marcellus', serif;
  font-size: 42px;
  line-height: 54.6px;
  text-align: left;
  margin-bottom: 20px;
  font-weight: 700; /* Bold */
}

.hero-subtitle {
  color: #3f6655;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 24px;
  line-height: 26.4px;
  border-bottom: 1px solid #b2c2bb;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.hero-testimonial {
  color: #41556b;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  line-height: 28px;
  margin-bottom: 24px;
}

.hero-btn {
  background-color: #3f6655;
  color: #f8f7ef;
  padding: 12px 24px;
  border-radius: 35px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.hero-btn:hover {
  background-color: #2d5042;
}

.hero-image {
  flex: 1;
  background-image: url('...');
  background-size: cover;
  background-position: center;
  min-height: 580px;
}
```

---

### Example 2: Condition Card Grid

```html
<section class="conditions-section">
  <div class="container">
    <h2 class="section-title">Conditions We Treat</h2>
    <p class="section-subtitle">
      Our registered dietitian nutritionists meet with patients virtually...
    </p>

    <div class="conditions-grid">
      <div class="condition-card">
        <div class="condition-icon">
          <!-- SVG Icon -->
        </div>
        <h3 class="condition-title">Sustainable Weight Loss</h3>
      </div>
      <div class="condition-card">
        <div class="condition-icon">
          <!-- SVG Icon -->
        </div>
        <h3 class="condition-title">Gastrointestinal and Gut Health</h3>
      </div>
      <!-- More cards... -->
    </div>

    <div class="conditions-cta">
      <a href="#" class="conditions-cta-btn">Get Started</a>
    </div>
  </div>
</section>
```

```css
.conditions-section {
  padding: var(--spacing-3xl) 0;
  background-color: #f8f7ef;
}

.section-title {
  color: #3f6655;
  font-family: 'Marcellus', serif;
  font-size: 50px;
  line-height: 60px;
  text-align: center;
}

.section-subtitle {
  color: #41556b;
  font-family: 'Plus Jakarta Sans', sans-serif;
  line-height: 24px;
  text-align: center;
  max-width: 1000px;
  margin: 24px auto 0;
}

.conditions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
}

.condition-card {
  background-color: #b6ccae26;
  border: 1px solid #3f6655;
  border-radius: 10px;
  padding: var(--spacing-xl);
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 8px 8px 0 #e5ded6;
}

.condition-card:hover {
  transform: translateY(-2px) translateX(-2px);
  border-width: 2px;
}

.condition-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-md);
  background-color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.condition-title {
  color: #3f6655;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 18px;
  line-height: 27px;
  text-align: center;
}

.conditions-cta {
  text-align: center;
  margin-top: 48px;
}

.conditions-cta-btn {
  background-color: #3f6655;
  color: #fff;
  padding: 16px 40px;
  border-radius: 35px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.conditions-cta-btn:hover {
  background-color: #2f5645;
}
```

---

### Example 3: Trust Statistics Section

```html
<section class="trust-section">
  <div class="container">
    <h2 class="trust-title">Registered dietitians you can trust</h2>
    <div class="trust-stats">
      <div class="trust-stat">
        <div class="trust-number">10,000+</div>
        <div class="trust-label">patients served</div>
      </div>
      <div class="trust-stat">
        <div class="trust-number">95</div>
        <div class="trust-label">patient NPS</div>
      </div>
      <div class="trust-stat">
        <div class="trust-number">50</div>
        <div class="trust-label">states</div>
      </div>
      <div class="trust-stat">
        <div class="trust-number">2,000+</div>
        <div class="trust-label">referring physicians</div>
      </div>
    </div>
  </div>
</section>
```

```css
.trust-section {
  background-color: var(--primary-green);
  color: var(--white);
  padding: var(--spacing-2xl) 0;
  text-align: center;
}

.trust-title {
  color: #fff;
  font-family: 'Marcellus', serif;
  font-size: 50px;
  line-height: 60px;
  font-weight: 700; /* Bold */
  margin-bottom: 41px;
}

.trust-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  max-width: 1000px;
  margin: 0 auto;
}

.trust-stat {
  padding: var(--spacing-md);
}

.trust-number {
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 45px;
  font-weight: 700;
  line-height: 54px;
  margin-bottom: 22px;
}

.trust-label {
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 20px;
  line-height: 30px;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 1024px) {
  .trust-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .trust-stats {
    grid-template-columns: 1fr;
  }
}
```

---

### Example 4: CTA Banner

```html
<section class="cta-banner">
  <div class="container">
    <div class="cta-banner-content">
      <span class="cta-banner-text"
        >Book a Virtual Session With a Registered Dietitian</span
      >
      <a href="#" class="btn btn-secondary">Start Your Journey →</a>
    </div>
  </div>
</section>
```

```css
.cta-banner {
  background-color: #5e69bd;
  color: #fff;
  padding: 1.68rem 0;
  text-align: center;
}

.cta-banner-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-lg);
}

.cta-banner-text {
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  line-height: 24px;
}

.cta-banner .btn {
  background-color: #fff;
  border-radius: 35px;
  padding: 16px 40px;
}

.cta-banner .btn-secondary {
  color: #3f6655;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  line-height: 28.8px;
}
```

---

### Example 5: Footer with Newsletter Buttons

```html
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-column">
        <div class="logo" style="color: white;">
          <div class="logo-icon" style="background-color: white;"></div>
          <span>NutriSensia</span>
        </div>

        <div class="social-links">
          <a href="#" class="social-icon">📘</a>
          <a href="#" class="social-icon">▶</a>
          <a href="#" class="social-icon">💼</a>
        </div>

        <div class="footer-cta" style="margin-top: 2rem;">
          <h3>Subscribe to our Patient Newsletter</h3>
          <a href="#" class="btn-newsletter-patient">Subscribe →</a>
        </div>

        <div class="footer-cta" style="margin-top: 2rem;">
          <h3>Subscribe to our Provider Newsletter</h3>
          <a href="#" class="btn-newsletter-provider">Subscribe →</a>
        </div>
      </div>

      <div class="footer-column">
        <h3>What We Treat</h3>
        <ul class="footer-links">
          <li><a href="#">Sustainable Weight Loss</a></li>
          <li><a href="#">Diabetes and Prediabetes</a></li>
          <!-- More links... -->
        </ul>
      </div>

      <!-- More columns... -->
    </div>

    <div class="footer-bottom">
      <div class="footer-compliance">
        <span>🏥 HIPAA COMPLIANT</span>
      </div>
      <p>© NutriSensia. All Rights Reserved.</p>
      <div class="footer-legal">
        <a href="#">Terms & Conditions</a> |
        <a href="#">Privacy Policy</a>
      </div>
    </div>
  </div>
</footer>
```

```css
.footer {
  background-color: #3f6655;
  color: #fff;
  padding: var(--spacing-3xl) 0 var(--spacing-lg);
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.footer-column h3 {
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 27px;
  margin-bottom: 12px;
  margin-top: 30px;
}

.footer-column h3:first-child {
  margin-top: 0;
}

.footer-links {
  list-style: none;
  margin-bottom: 30px;
}

.footer-links a {
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  line-height: 30.4px;
  transition: color 0.3s;
}

.footer-links a:hover {
  text-decoration: underline;
}

.btn-newsletter-patient {
  background-color: #b4cafa;
  color: #3f6655;
  padding: 16px 40px;
  border-radius: 35px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 25.2px;
  text-decoration: none;
  display: inline-block;
}

.btn-newsletter-provider {
  background-color: #fff;
  color: #3f6655;
  padding: 16px 40px;
  border-radius: 35px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 25.2px;
  text-decoration: none;
  display: inline-block;
}

.social-links {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.social-icon {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.social-icon:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: var(--spacing-lg);
  text-align: center;
}

.footer-bottom p {
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  line-height: 18.2px;
}

.footer-legal a {
  color: #fff;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Implementation Notes

### Key Design Tokens Summary

**Signature Elements**:

1. **Shadow Pattern**: `8px 8px 0 #E5DED6` - The defining visual element
2. **Card Hover**: `translateY(-2px) translateX(-2px)` + border thickens to 2px
3. **Underline Accent**: 1px solid #b2c2bb with 8px padding-bottom
4. **Font Pairing**: Marcellus (serif) + Plus Jakarta Sans (sans-serif)
5. **Button Shape**: 35px border-radius (pill-shaped)
6. **Primary Green**: #3f6655 used consistently for headings and CTAs

**Color Strategy**:

- Backgrounds alternate: #ffffff → #f8f7ef → #ffffff
- Dark sections use #3f6655 or #4A6B5C with white text
- Accent sections use #9461bc (purple) or #5e69bd (blue) for high visibility
- Card backgrounds use 15% opacity green (#b6ccae26)

**Spacing Strategy**:

- Section padding: 80px or 96px vertical
- Card padding: 48px-60px
- Grid gaps: 32px-48px
- Element spacing: 12px-24px

**Typography Strategy**:

- Headings (H1, H2, H3): Always Marcellus, #3f6655, **weight: 700 (bold)**
- Body: Always Plus Jakarta Sans, typically #41556b
- Weight 400 for body, 600-700 for buttons and emphasis
- Line-height 1.2 for headings, 1.5-1.6 for body
- **IMPORTANT**: All section titles must be bold (fontWeight: 700)

### Browser Compatibility

- Uses modern CSS Grid and Flexbox
- Smooth scroll behavior
- CSS variables for theming
- Transitions for interactive elements
- Fallback font stacks for typography

### Performance Considerations

- Google Fonts preconnected
- SVG icons for scalability
- Minimal shadow complexity
- Simple transitions (0.3s)
- Optimized for 60fps animations

---

## 12. Palette Méditerranée - Design System Update

Cette section documente les patterns de design mis à jour pour le site NutriSensia, basés sur la refonte de la page Remboursement.

### Couleurs Principales Méditerranée

```css
/* Turquoise Méditerranée - Couleur principale */
--turquoise-mediterranee: #1b998b; /* Titres H1/H2, CTAs, icônes */
--turquoise-fonce: #147569; /* Hover state des boutons */
--turquoise-pale: rgba(27, 153, 139, 0.08); /* Backgrounds badges, notes */

/* Couleurs de fond */
--fond-blanc: #ffffff; /* Sections blanches */
--fond-creme: #f8f7ef; /* Crème chaud - sections alternées */
--fond-beige: #e5ded6; /* Beige Sand - sections alternées */

/* Couleurs de texte */
--texte-body: #41556b; /* Paragraphes */
--texte-strong: #1a1a1a; /* Texte en gras, emphasis */
--texte-blanc: #fdfcfb; /* Texte sur fond coloré */
```

### Typographie Méditerranée

#### H1 - Titres Principaux (Hero)

```css
h1 {
  font-family: 'Marcellus', serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 57.6px;
  color: #1b998b;
  text-align: left;
}
```

#### H2 - Titres de Section (Standard)

```css
h2 {
  font-family: 'Marcellus', serif;
  font-size: 42px;
  font-weight: 700;
  line-height: 50.4px;
  color: #1b998b;
  margin-bottom: 24px;
}
```

#### H2 - Titres de Section (Variant léger)

Pour certains titres de bandeau ou sections secondaires :

```css
h2.light {
  font-family: 'Marcellus', serif;
  font-size: 42px;
  font-weight: 400; /* Regular, pas bold */
  line-height: 50.4px;
  color: #1b998b;
}
```

#### H3 - Sous-titres et Encadrés

```css
h3 {
  font-family: 'Marcellus', serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
  color: #1b998b;
  margin-bottom: 12px;
}
```

#### Body Text

```css
p {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 16px;
  line-height: 24px; /* IMPORTANT: Utiliser 24px, pas 1.7 */
  color: #41556b;
  margin-bottom: 16px;
}
```

#### Subtitle Text

```css
.subtitle {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 18px;
  line-height: 28px;
  color: #41556b;
}
```

### Composants Méditerranée

#### Badge Pill (Certifications, Labels)

```css
.badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(27, 153, 139, 0.08);
  padding: 8px 20px;
  border-radius: 35px;
  margin-bottom: 24px;
}

.badge-pill span {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1b998b;
  letter-spacing: 0.5px;
}

.badge-pill svg {
  width: 16px;
  height: 16px;
  color: #1b998b;
}
```

#### Bouton CTA Principal (avec Dégradé)

**IMPORTANT** : Tous les CTAs utilisent par défaut un dégradé turquoise pour une meilleure cohérence visuelle et un impact visuel plus fort.

```css
.btn-cta {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 35px;
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 25.2px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  /* DÉGRADÉ PAR DÉFAUT - Turquoise Méditerranée */
  background: linear-gradient(135deg, #1b998b 0%, #147569 100%);
  color: #fdfcfb;
  text-decoration: none;
}

.btn-cta:hover {
  /* Version plus foncée du dégradé au survol */
  background: linear-gradient(135deg, #147569 0%, #0f5a50 100%);
}
```

#### Bouton CTA Large

```css
.btn-cta-large {
  padding: 14px 32px;
  font-weight: 700;
}
```

#### Encadré Note/Important

```css
.note-box {
  background-color: rgba(27, 153, 139, 0.08);
  border-radius: 16px;
  padding: 32px 40px;
  border: 1px solid #e5ded6;
  text-align: left; /* Aligné à gauche pour le contenu */
}

.note-box h3 {
  font-family: 'Marcellus', serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
  color: #1b998b;
  margin-bottom: 12px;
}

.note-box p {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 16px;
  line-height: 26px;
  color: #41556b;
  margin: 0;
}
```

#### Encadré Note Centré (pour section bonus)

```css
.note-box-centered {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}
```

### Layouts de Section

#### Section Split (Image + Texte)

```css
.section-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 96px 24px;
}

/* Image avec shadow décalée */
.section-split-image {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 8px 8px 0 #e5ded6; /* ou 12px 12px pour plus d'impact */
}

/* Responsive */
@media (max-width: 900px) {
  .section-split {
    grid-template-columns: 1fr;
    gap: 48px;
  }
}
```

#### Section Hero Split

```css
.hero-split {
  background-color: #f8f7ef;
  padding: 120px 0 80px;
}

.hero-split-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}
```

#### Section Cartes en Grille

```css
.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
```

### Alternance des Backgrounds

Pour maintenir un rythme visuel cohérent :

```
Section 1: #ffffff (blanc)
Section 2: rgba(27, 153, 139, 0.08) (turquoise pale) - bandeau logos
Section 3: #ffffff (blanc)
Section 4: #E76F51 (terracotta) - CTA banner
Section 5: #ffffff (blanc)
Section 6: #E5DED6 (beige sand)
Section 7: #f8f7ef (crème chaud)
Section 8: #1B998B (turquoise) - FAQ
```

### FAQ Accordion Style

```css
.faq-section {
  background-color: #1b998b;
  padding: 100px 24px 80px;
}

.faq-title {
  font-family: 'Marcellus', serif;
  font-size: 48px;
  line-height: 57.6px;
  font-weight: 700;
  color: #ffffff;
}

.faq-subtitle {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 18px;
  line-height: 28px;
  color: rgba(255, 255, 255, 0.9);
}

.faq-question {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  line-height: 27px;
}

.faq-answer {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: rgba(255, 255, 255, 0.9);
}

.faq-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px 0;
}
```

### CTA Banner (Terracotta)

```css
.cta-banner {
  background-color: #e76f51;
  padding: 2rem 0;
}

.cta-banner-text {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.cta-banner-btn {
  background-color: #ffffff;
  border-radius: 35px;
  padding: 14px 32px;
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #147569;
  text-decoration: none;
}

.cta-banner-btn:hover {
  background-color: #f0f0f0;
}
```

### Process Cards (Comment ça marche)

```css
.process-card {
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.process-card-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.process-card-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #1b998b;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(27, 153, 139, 0.4);
}

.process-card-badge span {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.process-card-content {
  padding: 24px;
}

.process-card-title {
  font-family: 'Marcellus', serif;
  font-size: 20px;
  font-weight: 700;
  color: #1b998b;
  margin-bottom: 12px;
}

.process-card-description {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #41556b;
}
```

### Advice Cards (Bon à savoir)

```css
.advice-card {
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 6px 6px 0 #e5ded6;
}

.advice-card-icon {
  width: 48px;
  height: 48px;
  background-color: rgba(27, 153, 139, 0.08);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.advice-card-icon svg {
  width: 24px;
  height: 24px;
  color: #1b998b;
}

.advice-card-title {
  font-family: 'Marcellus', serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 26px;
  color: #1b998b;
  margin-bottom: 4px;
}

.advice-card-subtitle {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: #1b998b;
  font-style: italic;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5ded6;
}

.advice-card-description {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 14px;
  line-height: 22px;
  color: #41556b;
  margin-bottom: 16px;
}

/* Feature list avec checkmarks */
.advice-card-features li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.advice-card-features .checkmark {
  width: 16px;
  height: 16px;
  background-color: #4a9b7b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.advice-card-features span {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 13px;
  line-height: 20px;
  color: #41556b;
}
```

### Règles de Ton de Voix

- **Utiliser "nous"** au lieu de "je/moi" pour la voix de NutriSensia
- **Exceptions** : Les questions FAQ du point de vue utilisateur gardent "je/mon/ma"
- **CTA utilisateur** : "Réserver ma première consultation" (point de vue utilisateur)

### Responsive Breakpoints

```css
/* Large Tablets */
@media (max-width: 1024px) {
  h1 {
    font-size: 42px;
    line-height: 50px;
  }
  h2 {
    font-size: 36px;
    line-height: 44px;
  }
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 768px) {
  h1 {
    font-size: 32px;
    line-height: 40px;
  }
  h2 {
    font-size: 28px;
    line-height: 36px;
  }
  .section-split {
    grid-template-columns: 1fr;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  h1 {
    font-size: 28px;
    line-height: 36px;
  }
  h2 {
    font-size: 24px;
    line-height: 32px;
  }
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
```

---

**End of Style Guide**

_This comprehensive guide documents all visual design elements, components, and patterns found in the NutriSensia application. Updated with Palette Méditerranée design system from the Remboursement page refactoring._
