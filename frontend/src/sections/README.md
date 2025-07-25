# Sections System

This directory contains a CMS-style section system that allows for flexible, dynamic page building. The system is designed to be extensible and easy to use, enabling the creation of pages with different layouts and content without having to write custom code for each page.

## Overview

The sections system consists of:

1. **Section Components**: Reusable Vue components that represent different types of content sections (hero banners, feature lists, etc.)
2. **Section Registry**: A central registry that maps section keys to their respective components
3. **SectionRenderer**: A component that dynamically renders sections based on their type
4. **PageBuilder**: A component that renders multiple sections to build a complete page

## Directory Structure

```
src/sections/
├── auth/              # Authentication-related sections
├── common/            # Common sections used across the application
├── dashboard/         # Dashboard-specific sections
├── investment/        # Investment-related sections
├── property/          # Property-related sections
├── index.ts           # Section registry and utility functions
└── README.md          # This documentation file
```

## How to Use

### 1. Rendering a Single Section

```vue
<script setup lang="ts">
import SectionRenderer from '@/components/SectionRenderer.vue';
</script>

<template>
  <SectionRenderer 
    section-key="common/hero" 
    :data="{ 
      title: 'Welcome', 
      subtitle: 'This is a hero section',
      backgroundImage: '/path/to/image.jpg'
    }" 
  />
</template>
```

### 2. Building a Page with Multiple Sections

```vue
<script setup lang="ts">
import PageBuilder from '@/components/PageBuilder.vue';

const pageSections = [
  {
    id: 'hero-1',
    type: 'common/hero',
    data: {
      title: 'Welcome',
      subtitle: 'This is a hero section',
      backgroundImage: '/path/to/image.jpg'
    }
  },
  {
    id: 'features-1',
    type: 'common/features',
    data: {
      title: 'Our Features',
      features: [
        { title: 'Feature 1', description: 'Description 1' },
        { title: 'Feature 2', description: 'Description 2' }
      ]
    }
  }
];
</script>

<template>
  <PageBuilder :sections="pageSections" />
</template>
```

### 3. Creating a New Section Component

1. Create a new Vue component in the appropriate subdirectory
2. Register it in `src/sections/index.ts`

Example:

```vue
<!-- src/sections/common/TestimonialSection.vue -->
<script setup lang="ts">
import { defineProps } from 'vue';

interface Props {
  title?: string;
  testimonials?: Array<{
    quote: string;
    author: string;
    role?: string;
  }>;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'What Our Customers Say',
  testimonials: () => []
});
</script>

<template>
  <section class="testimonial-section">
    <h2>{{ title }}</h2>
    <div class="testimonials">
      <div v-for="(item, index) in testimonials" :key="index" class="testimonial">
        <blockquote>{{ item.quote }}</blockquote>
        <cite>{{ item.author }}{{ item.role ? `, ${item.role}` : '' }}</cite>
      </div>
    </div>
  </section>
</template>
```

Then register it in the section registry:

```typescript
// In src/sections/index.ts
const sections: SectionRegistry = {
  // ... existing sections
  'common/testimonials': () => import('./common/TestimonialSection.vue'),
};
```

## Best Practices

1. **Keep Sections Focused**: Each section should have a single responsibility
2. **Use Props for Configuration**: Make sections configurable through props
3. **Provide Sensible Defaults**: Use `withDefaults` to provide default values for props
4. **Consistent Styling**: Maintain consistent styling across sections
5. **Responsive Design**: Ensure all sections work well on different screen sizes
6. **Error Handling**: Handle missing or invalid data gracefully

## Available Sections

### Common Sections

- `common/hero`: A hero banner with title, subtitle, and call-to-action
- `common/features`: A grid of features with icons, titles, and descriptions
- `common/footer`: A footer with company information, links, and social media
- `common/not-found`: Displayed when a requested section is not found
- `common/error`: Displayed when there's an error loading a section
- `common/loading`: Displayed while a section is loading

### Auth Sections

- `auth/login`: Login form
- `auth/register`: Registration form

### Dashboard Sections

- `dashboard/summary`: Dashboard summary with key metrics
- `dashboard/stats`: Detailed statistics and charts

### Property Sections

- `property/list`: List of properties
- `property/detail`: Detailed view of a property

### Investment Sections

- `investment/opportunities`: Available investment opportunities
- `investment/portfolio`: User's investment portfolio