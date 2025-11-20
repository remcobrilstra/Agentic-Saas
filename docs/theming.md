# Theming Guide

This project uses a comprehensive theming system built on Tailwind CSS v4 and CSS variables. This allows for easy rebranding and dark mode support without changing component code.

## Overview

The theme is defined in `src/app/globals.css` using CSS variables. These variables are mapped to Tailwind utilities in the `@theme` block.

## Customizing the Theme

To change the theme, simply update the HSL values of the CSS variables in `src/app/globals.css`.

### Color Variables

The following semantic color variables are available:

- `--background`: Page background color.
- `--foreground`: Default text color.
- `--card`: Background color for cards.
- `--card-foreground`: Text color for content inside cards.
- `--popover`: Background color for popovers and dropdowns.
- `--popover-foreground`: Text color for popovers.
- `--primary`: Primary brand color (buttons, active states).
- `--primary-foreground`: Text color for primary elements.
- `--secondary`: Secondary color (muted buttons, backgrounds).
- `--secondary-foreground`: Text color for secondary elements.
- `--muted`: Muted background color (subtle backgrounds).
- `--muted-foreground`: Muted text color (subtitles, placeholders).
- `--accent`: Accent color (hover states, highlights).
- `--accent-foreground`: Text color for accent elements.
- `--destructive`: Destructive color (error states, delete actions).
- `--destructive-foreground`: Text color for destructive elements.
- `--border`: Border color.
- `--input`: Border color for inputs.
- `--ring`: Focus ring color.

### Radius Variables

- `--radius`: Base border radius for components.

## Dark Mode

Dark mode is supported out of the box. The `.dark` class overrides the CSS variables with dark mode values.

To customize dark mode, edit the variables inside the `.dark` block in `src/app/globals.css`.

## Adding New Colors

1.  Define the new variable in `:root` (and `.dark` if needed).
2.  Add the variable to the `@theme` block in `src/app/globals.css`.

```css
:root {
  --new-color: 120 50% 50%;
}

@theme inline {
  --color-new-color: hsl(var(--new-color));
}
```

You can then use it in your components as `bg-new-color`, `text-new-color`, etc.
