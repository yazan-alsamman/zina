# Performance & Accessibility

## Performance philosophy
The premium visual experience must not become a slow experience.

## Core Web Vitals
Treat these as first-class release criteria:
- LCP
- INP
- CLS

## Performance priorities
1. Fast initial HTML
2. Correct LCP media handling
3. Responsive images
4. Font optimization
5. Minimal JavaScript
6. Lazy loading below fold
7. Animation discipline
8. Third-party script control
9. Caching
10. Compression

## Media rules
Every large image should have:
- responsive dimensions
- modern format
- appropriate quality
- width/height
- loading strategy

Video must be:
- compressed
- poster-backed
- lazy where possible
- disabled/reduced when motion is reduced

## Accessibility
Target WCAG 2.2 AA as the design/development benchmark.

Check:
- keyboard navigation
- visible focus
- semantic headings
- landmark structure
- labels
- form errors
- alt text
- color contrast
- reduced motion
- touch target size
- screen-reader announcements
- no keyboard traps
- logical tab order

## Performance budget
Define measurable budgets during engineering:
- JS budget
- initial image budget
- font budget
- third-party script budget
- page count/DOM complexity limits

Do not use vague statements like “very fast”; measure it.
