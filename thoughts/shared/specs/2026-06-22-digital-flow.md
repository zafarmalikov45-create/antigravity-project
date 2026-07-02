# Digital Flow Website Specification

## Executive Summary
Digital Flow is an AI automation agency specializing in streamlining operations for businesses. To attract and convince developers, technical partners, and decision-makers, we are building a premium, high-converting B2B showcase website. The site features a state-of-the-art interactive 3D hero section, high-fidelity CSS glassmorphism, and a hands-on interactive automation playground.

## Problem Statement
Traditional AI automation service websites are often dry, text-heavy, and fail to demonstrate technical capabilities in an engaging way. Developers and technical leaders are skeptical of generic AI buzzwords; they need to see clean design, modern ergonomics, and interactive proof of concept features to trust an agency's technical caliber.

## Success Criteria
* **WOW-Effect:** Seamless 3D interaction in the hero section at 60fps on desktop devices.
* **Premium Brand Image:** An award-winning look in a clean, light color scheme with frosted glass elements and elegant indigo/violet accents.
* **Conversion & Engagement:** High interaction rates on the node-connector automation playground and clicks to learn about services.
* **Mobile Excellence:** Flawless load times and fluid scroll animations on mobile devices by gracefully substituting complex 3D scenes for optimized 2D typography/layout.

## User Personas
* **Dev Lead / CTO (Technical decision-maker):** Skeptical of AI buzzwords, values robust APIs, developer ergonomics, and visual elegance.
* **Operations Director / Product Owner:** Focuses on efficiency gains, ROI, and how AI can automate standard business workflows (e.g., webhook to action).

## User Journey
1. **Landing & Loading:** A clean, frosted-glass skeleton loader displays briefly while Three.js assets compile, preventing any flash of unstyled content (FOUC).
2. **Hero Screen:** The loader fades out to reveal a premium light-themed hero section with a giant interactive morphing 3D glass blob responding to mouse coordinates. Large, elegant sans-serif typography introduces "Digital Flow".
3. **Interactive Playground:** As the user scrolls down, the 3D scene smoothly transitions or fades out. They are presented with a glassmorphic mock dashboard featuring a visual node connector where they can run a mock AI automation pipeline (Trigger -> AI Block -> Action).
4. **Services & Case Studies:** Clear cards detailing AI workflows, speed gains, and technical case studies with subtle micro-animations.
5. **Contact Footer:** A simple, high-end integration request form tailored to developers (asking for integration requirements, API details, etc.).

## Functional Requirements

### Must Have (P0)
* **Interactive 3D Glassmorphic Canvas (Desktop):** A Three.js canvas rendering a morphing sphere using vertex shader noise. The material must utilize physical properties (`MeshPhysicalMaterial`) to render high-refraction glass that reacts to mouse movement.
* **Light Theme & Glassmorphism:** Custom Vanilla CSS styling utilizing modern properties like `backdrop-filter: blur()`, clean borders, and a harmonious light palette with indigo/violet gradients.
* **Interactive Node Connector:** A client-side visual component where users can select automation steps (e.g., Webhook Trigger -> Translate Text -> Post to Slack) and run a visual simulation with a simulated terminal output.
* **Mobile Optimization:** Detection of mobile devices or WebGL limitations, automatically hiding the 3D canvas and scaling the font sizes to keep the page readable, fast, and elegant.
* **Minimalist Skeleton Loader:** A CSS-based loader that masks the page until all Three.js materials are fully initialized.

### Should Have (P1)
* **GSAP-powered scroll triggers:** Interactive transitions of text elements and cards as they enter the viewport.
* **API Snippet Switcher:** A tabbed code block in the developer section showing how to execute automation flows in Python, Curl, and Node.js.

### Nice to Have (P2)
* **Dark/Light Mode Toggle:** Dynamic switching of color styles (post-MVP).

## Technical Architecture

### Data Model (Client-Side State)
* **Node Pipeline State:** Tracks user choices in the interactive playground (Selected Trigger, Selected AI Model, Selected Action).
* **WebGL/UI State:** Tracks cursor coordinates, scroll offset, and loader completion.

### System Components
* **`index.html`:** The primary layout structure using semantic HTML5 elements.
* **`index.css`:** The custom core design system, CSS variables for colors, typography imports, glassmorphism utilities, and animations.
* **`app.js`:** Main application script handling page interactions, custom loaders, and the node connector simulation.
* **`three-scene.js`:** Three.js setup, custom vertex/fragment shaders for the glass blob, lighting, environmental mapping, and mouse-follow listeners.
* **`libs/`:** Local or CDN scripts for Three.js, GSAP, and Lucide Icons.

### Security Model
* Standard static front-end security practices (no secret keys exposed in client-side code).
* Sanitization of form inputs in the contact form.

## Non-Functional Requirements
* **Performance:** Google Lighthouse performance score of 90+ on desktop, and 85+ on mobile.
* **Responsiveness:** Fluid grid layouts supporting 320px up to 2560px screen widths.
* **Visual Frame Rate:** The 3D canvas must target 60fps on modern integrated GPUs (e.g., Apple M-series, Intel Iris Xe).

## Appendix: Research Findings
Using vanilla Three.js for glassmorphism requires:
1. `MeshPhysicalMaterial` with settings: `transmission: 1.0`, `roughness: 0.05`, `thickness: 0.8`, `ior: 1.5` (Index of Refraction).
2. Direct environment lights or a subtle background gradient texture mapped as an environment map (`scene.environment`) to drive the refraction colors.
3. Simplex/Perlin noise function inside a custom vertex displacement shader to animate shape distortion over time.
