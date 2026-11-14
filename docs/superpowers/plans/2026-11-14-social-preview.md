# Social Preview Implementation Plan

> **For agentic workers:** Implement inline using superpowers:executing-plans.

**Goal:** Display approved concept 3 when the live website is shared.

**Architecture:** Render brand-preserving vector artwork to a static PNG. Next.js file conventions provide image metadata; root metadata supplies social titles and descriptions.

**Tech Stack:** Next.js 16, Python fontTools, SVG, Sharp.

**Spec:** ../specs/2026-11-14-social-preview-design.md

## Global Constraints

- 1200 × 630 PNG, exact logo assets, cream/forest palette.
- No changes to interactive application behavior.

## Review Focus

- Confirm image readability, safe margins, exact logo, and plausible code state.
- Confirm absolute social image URLs and large Twitter card metadata.
- Keep PNG below sharing platform size limits.

### Task 1: Artwork and integration

- [x] Create reproducible SVG artwork and render `src/app/opengraph-image.png`.
- [x] Add image alt text and root Open Graph/Twitter metadata.
- [x] Check PNG dimensions and visually inspect the rendered artifact.
- [x] Run lint/build and inspect served HTML and image response.
