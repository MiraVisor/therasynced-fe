# Font Usage Guide

This project uses three Google Fonts: **Poppins**, **Inter**, and **Open Sans**. Each font serves different purposes in the design system.

## Available Fonts

### 1. Poppins (`font-poppins`)

- **Use Case**: Modern, friendly headings and hero sections
- **Characteristics**: Geometric, rounded, approachable
- **Best For**: Brand headlines, hero sections, feature titles

### 2. Inter (`font-inter`)

- **Use Case**: UI elements, navigation, buttons
- **Characteristics**: Optimized for screens, high legibility
- **Best For**: Interface elements, forms, navigation menus

### 3. Open Sans (`font-open-sans`)

- **Use Case**: Body text, readable content
- **Characteristics**: Humanist, neutral, highly readable
- **Best For**: Paragraphs, descriptions, long-form content

## How to Use

### Tailwind CSS Classes

```html
<!-- Poppins Font -->
<h1 class="font-poppins text-2xl font-bold">Main Heading</h1>
<h2 class="font-poppins text-xl font-semibold">Section Title</h2>

<!-- Inter Font -->
<nav class="font-inter font-medium">Navigation Item</nav>
<button class="font-inter font-semibold">Button Text</button>
<label class="font-inter text-sm">Form Label</label>

<!-- Open Sans Font -->
<p class="font-open-sans text-base">Body paragraph text</p>
<span class="font-open-sans text-sm">Caption text</span>
```

### CSS Custom Properties

You can also use CSS custom properties directly:

```css
.custom-heading {
  font-family: var(--font-poppins);
  font-weight: 700;
}

.custom-ui-text {
  font-family: var(--font-inter);
  font-weight: 500;
}

.custom-body-text {
  font-family: var(--font-open-sans);
  font-weight: 400;
}
```

## Font Weight Classes

All fonts support these Tailwind font-weight classes:

- `font-light` (300)
- `font-normal` (400)
- `font-medium` (500)
- `font-semibold` (600)
- `font-bold` (700)
- `font-extrabold` (800)
- `font-heavy` (900)

## Design System Recommendations

### Typography Hierarchy

```html
<!-- Hero Section -->
<h1 class="font-poppins text-4xl font-bold">Hero Title</h1>
<p class="font-inter text-xl font-medium">Hero Subtitle</p>

<!-- Page Headers -->
<h1 class="font-poppins text-3xl font-bold">Page Title</h1>
<h2 class="font-poppins text-2xl font-semibold">Section Header</h2>
<h3 class="font-inter text-xl font-semibold">Subsection Header</h3>

<!-- Body Content -->
<p class="font-open-sans text-base">Main body text for readability</p>
<p class="font-open-sans text-sm">Secondary body text</p>

<!-- UI Elements -->
<button class="font-inter font-semibold">Primary Button</button>
<nav class="font-inter font-medium">Navigation Link</nav>
<label class="font-inter text-sm font-medium">Form Label</label>
```

### Card Components Example

```html
<div class="bg-card p-6 rounded-lg">
  <h3 class="font-poppins text-xl font-bold mb-2">Card Title</h3>
  <p class="font-inter text-sm font-medium text-muted-foreground mb-3">Card Subtitle</p>
  <p class="font-open-sans text-base">Card description and body content for maximum readability.</p>
</div>
```

## Implementation Details

### Layout Configuration

The fonts are imported and configured in `src/app/layout.tsx`:

```tsx
import { Inter, Open_Sans, Poppins } from 'next/font/google';

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});
```

### Tailwind Configuration

Font families are configured in `tailwind.config.js`:

```javascript
fontFamily: {
  'open-sans': ['var(--font-open-sans)', 'sans-serif'],
  'inter': ['var(--font-inter)', 'sans-serif'],
  'poppins': ['var(--font-poppins)', 'sans-serif'],
}
```

## Best Practices

1. **Consistency**: Stick to the designated use cases for each font
2. **Performance**: Fonts are optimized and self-hosted via Next.js
3. **Fallbacks**: Sans-serif fallbacks are provided for all fonts
4. **Accessibility**: All fonts maintain good contrast and readability
5. **Responsive**: Adjust font sizes appropriately for different screen sizes

## Examples in Your Project

Check `src/components/FontExamples.tsx` for live examples of all three fonts in action.
