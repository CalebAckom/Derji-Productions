# Derji Productions Design System

A comprehensive design system featuring the distinctive golden circuit-board aesthetic with responsive components and modern typography.

## Overview

The Derji Productions Design System provides a cohesive set of reusable UI components, design tokens, and utilities that embody the brand's golden circuit-board aesthetic. Built with React, TypeScript, and Tailwind CSS, it ensures consistency across the entire application while maintaining flexibility and accessibility.

## Key Features

- **Golden Circuit-Board Theme**: Distinctive visual identity with golden accents and circuit-board patterns
- **Responsive Design**: Mobile-first approach with consistent breakpoints
- **Accessibility**: WCAG 2.1 AA compliant components
- **TypeScript Support**: Full type safety and IntelliSense support
- **Modular Architecture**: Tree-shakeable components for optimal bundle size
- **Dark Mode Ready**: Built-in support for dark mode themes

## Design Tokens

### Colors

#### Primary (Golden)
- `primary-50` to `primary-900`: Golden color palette from light to dark
- Main brand color: `primary-500` (#f59e0b)

#### Secondary (Slate)
- `secondary-50` to `secondary-900`: Neutral gray palette
- Used for text, backgrounds, and borders

#### Accent (Purple)
- `accent-50` to `accent-900`: Purple accent colors
- Used for highlights and special elements

#### Semantic Colors
- `success-*`: Green colors for success states
- `warning-*`: Amber colors for warning states
- `error-*`: Red colors for error states

### Typography

#### Font Families
- **Sans**: Inter (body text)
- **Display**: Poppins (headings)
- **Mono**: JetBrains Mono (code)

#### Typography Scale
- `text-xs` (12px) to `text-6xl` (60px)
- Responsive typography classes available
- Semantic classes: `heading-hero`, `heading-section`, `body-large`, etc.

### Spacing
- Consistent 4px base unit
- `spacing-1` (4px) to `spacing-32` (128px)
- Responsive spacing utilities

### Breakpoints
- `xs`: 475px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px
- `3xl`: 1600px

## Components

### Button

Versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="golden">Golden</Button>

// Sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// With icons and loading state
<Button leftIcon={<Icon />} loading>
  Loading...
</Button>
```

### Card

Flexible card component with header, body, and footer sections.

```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui';

<Card variant="hover">
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    <p>Card content goes here.</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Input

Form input component with validation states and icons.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  required
  variant="golden"
  leftIcon={<EmailIcon />}
  error="Please enter a valid email"
/>
```

### Modal

Accessible modal dialog with backdrop and keyboard navigation.

```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui';

<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader onClose={onClose}>
    Modal Title
  </ModalHeader>
  <ModalBody>
    <p>Modal content</p>
  </ModalBody>
  <ModalFooter>
    <Button onClick={onClose}>Close</Button>
  </ModalFooter>
</Modal>
```

### Loading States

#### Spinner
```tsx
import { Spinner, LoadingOverlay } from '@/components/ui';

<Spinner size="lg" color="primary" />

<LoadingOverlay isLoading={loading}>
  <YourContent />
</LoadingOverlay>
```

#### Skeleton
```tsx
import { Skeleton, SkeletonCard, SkeletonProfile } from '@/components/ui';

<Skeleton variant="text" />
<SkeletonCard />
<SkeletonProfile />
```

## Utilities

### Class Name Utility
```tsx
import { cn } from '@/utils/cn';

const className = cn(
  'base-classes',
  condition && 'conditional-class',
  'additional-classes'
);
```

### Responsive Breakpoints
```tsx
import { useBreakpoint, useBreakpointUp } from '@/utils/breakpoints';

const breakpoint = useBreakpoint(); // Current breakpoint
const isDesktop = useBreakpointUp('lg'); // lg and above
```

## CSS Classes

### Component Classes
- `.btn`, `.btn-primary`, `.btn-secondary`, etc.
- `.card`, `.card-hover`, `.card-golden`
- `.input`, `.input-error`, `.input-success`
- `.modal`, `.modal-backdrop`, `.modal-content`

### Utility Classes
- `.circuit-bg-light`, `.circuit-bg-medium`, `.circuit-bg-dark`
- `.glow-golden`, `.glow-golden-strong`
- `.gradient-golden`, `.text-gradient-golden`
- `.animate-fade-in`, `.animate-slide-up`, `.animate-pulse-golden`

### Typography Classes
- `.heading-hero`, `.heading-section`, `.heading-card`
- `.body-large`, `.body-normal`, `.body-small`
- `.caption`

## Best Practices

### Component Usage
1. Always use semantic HTML elements
2. Include proper ARIA attributes for accessibility
3. Use the `cn()` utility for conditional classes
4. Prefer design system components over custom styling

### Responsive Design
1. Use mobile-first approach
2. Test across all breakpoints
3. Use responsive spacing and typography classes
4. Consider touch targets on mobile devices

### Performance
1. Import only needed components
2. Use lazy loading for heavy components
3. Optimize images and media assets
4. Minimize custom CSS outside the design system

### Accessibility
1. Ensure proper color contrast ratios
2. Include focus states for interactive elements
3. Use semantic HTML and ARIA labels
4. Test with keyboard navigation and screen readers

## Customization

### Extending Colors
Add new colors to `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      brand: {
        50: '#...',
        // ... more shades
      }
    }
  }
}
```

### Custom Components
Follow the existing patterns when creating new components:

```tsx
export interface CustomComponentProps {
  variant?: 'default' | 'special';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const CustomComponent = React.forwardRef<HTMLDivElement, CustomComponentProps>(
  ({ variant = 'default', size = 'md', children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'base-classes',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
```

## Development

### Running the Design System Demo
```bash
npm run dev
```

Navigate to `/design-system` to see all components in action.

### Building
```bash
npm run build
```

### Testing
```bash
npm run test
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all props
3. Include accessibility considerations
4. Test across different screen sizes
5. Update documentation for new components

## License

This design system is part of the Derji Productions project and follows the same licensing terms.