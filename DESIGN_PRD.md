# Swasthya AI: Design PRD (Pro-Max Edition) 🎨

This document defines the high-fidelity design specifications for Swasthya AI, synthesizing intelligence from top-tier design sources like DesignSpells, Minimal Gallery, and Animate-UI.

## 1. Design Philosophy: "Empathetic Authority"
Our design must balance the **Precision** of medical science with the **Empathy** required for patient care.

## 2. Inspiration Analysis
| Source | Key Takeaway | Application in Swasthya |
|:---|:---|:---|
| **DesignSpells** | Delightful micro-interactions | Scanning beam effect during OCR; pulsing vitals status. |
| **Minimal Gallery** | Mastery of whitespace/grid | Clean, uncluttered report cards to reduce cognitive load. |
| **Landerfolio** | High-conversion hero sections | Immersive 3D dropzone with clear USP. |
| **GSAP / Animate-UI** | Sophisticated motion triggers | On-scroll "drawing" of medical icons and staggered card entry. |
| **Rive / Lottie** | Interactive vector loops | Transforming "Cross to Magnifier" analysis animation. |

## 3. The Visual System
### Color Palette
- **Deep Clinical Blue (`#0F172A`)**: Primary Authority.
- **Healing Seafoam (`#F0FDFA`)**: Calm backgrounds.
- **Vibrant Indigo (`#4F46E5`)**: Interactive "Superpower" elements.
- **Safety Rose (`#E11D48`)**: Critical alerts (pulsing).

### Typography
- **Headings**: `Inter` (Extra Bold) - High-tech authority.
- **Body**: `Public Sans` - Clinical clarity and readability.
- **Regional**: `Noto Sans Indic` - Culturally respectful and legible.

## 4. "Design Spells" & Animations
### A. The Scanning Beam (GSAP)
- **Effect**: A glowing line sweeps vertically over the uploaded image.
- **Spec**: `y: -100% to 100%`, `opacity: 0.5`, `ease: "power2.inOut"`, `repeat: -1`.

### B. The Vitals Pulse
- **Effect**: Critical status badges have a soft "heartbeat" glow.
- **Spec**: `scale: 1.05`, `boxShadow: "0 0 20px rgba(225, 29, 72, 0.4)"`, `duration: 0.8s`, `yoyo: true`.

### C. Staggered Insight Entry
- **Effect**: AI results (Hindi explanation, Summary) appear line-by-line.
- **Spec**: `opacity: 0`, `y: 20`, `stagger: 0.1s`, `ease: "expo.out"`.

## 5. UI Architecture: Progressive Disclosure
1. **The Hero Hub**: Centered upload zone with "Social Proof" (Trust badges).
2. **The Result Dashboard**: 
   - **Top bar**: Semantic Summary (Health Score).
   - **Center**: Annotated Image Viewer (Side-by-side with original).
   - **Bottom Grid**: Parameter cards with "Magic" hover states.
3. **The Knowledge Slide**: A side-panel for citations and research papers.

## 6. Implementation Roadmap (Animation Stack)
- **Engine**: Framer Motion (Transitions) + GSAP (Complex SVG/Scroll triggers).
- **Assets**: SVGs Optimized for WebP/SVG-animation.
- **Icons**: Lucide React (Customized with medical gradients).
