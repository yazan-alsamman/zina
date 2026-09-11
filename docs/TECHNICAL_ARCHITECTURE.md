# Technical Architecture

## Goal
Build a maintainable, SEO-first, production-grade website with a clean content architecture.

## Architecture principles
- semantic HTML
- accessible components
- reusable UI primitives
- server-first/indexable content where appropriate
- minimal client-side JavaScript
- optimized media
- stable URLs
- typed content models
- clear separation between content and presentation
- secure environment configuration
- automated quality checks

## Suggested stack
Claude Code should evaluate the current ecosystem and choose the most appropriate production stack.

A strong candidate:
- Next.js
- TypeScript
- Tailwind CSS or an equivalent token-driven styling system
- MDX or a headless CMS depending on editorial requirements
- modern image optimization
- Vercel or equivalent production hosting

Do not adopt a technology merely because it is fashionable. Document the decision and tradeoffs.

## Content architecture
Prefer structured content over hard-coded page blobs.

Minimum entities:
- Person/Profile
- Review
- Product
- Brand
- Work
- Journal Article
- Media Asset
- Social Profile

## URL rules
URLs must be:
- lowercase
- readable
- stable
- descriptive
- free of unnecessary IDs

## Component architecture
Organize components by:
- primitives
- layout
- navigation
- editorial
- reviews
- brands
- work
- forms
- media
- SEO

Avoid a giant monolithic component.

## Environment variables
Secrets must never be committed.
Provide:
- `.env.example`
- documentation of every variable
- separate development/production configuration

## Quality gates
Every phase should run relevant:
- type checks
- lint
- unit tests where useful
- build
- accessibility checks
- SEO validation
- performance checks
