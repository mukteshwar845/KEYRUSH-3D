# KEYRUSH — Accessibility Statement

**Effective Date:** October 12, 2026  
**Document Version:** 1.0.0  

---

## 1. Our Commitment

KEYRUSH is dedicated to making touch-typing improvement and motorsport racing accessible to as many players as possible, regardless of visual, motor, or cognitive abilities. We strive to align with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.

---

## 2. Accessibility Features Implemented

1. **Reduced Motion Mode:** An accessible toggle in **Settings → Appearance & Visuals** disables high-frequency screen shakes, intense nitro warp distortion, and kinetic speed lines for users with vestibular sensitivities or motion discomfort.
2. **High-Contrast Theme:** An OLED True Black theme and high-contrast color styling with prominent borders and WCAG AA compliant text contrast ratios.
3. **Tactile & Acoustic Feedback:** Multiple selectable mechanical switch tones (Cherry MX Blue, MX Red, Cyber-blip) offer audio confirmation for every keypress.
4. **Keyboard Navigability:** Full keyboard access support including Global Search Palette triggerable via `Ctrl+K` / `Cmd+K`, Tab key focus management, and Escape key dismissal of dialog modals.
5. **Accessible Form Labels & ARIA:** Interactive controls include descriptive `aria-label`, `role="button"`, and semantic HTML headings.

---

## 3. Known Limitations & Ongoing Enhancements

- 3D WebGL racing canvas visual elements are rendered via Three.js hardware acceleration; while HUD telemetry is accessible via live DOM overlays, direct screen-reader traversal of the 3D track mesh is currently in development.
- Assistive keyboard hardware compatibility is continuously tested.

---

## 4. Feedback & Barrier Reporting

If you encounter an accessibility barrier or have suggestions for assistive features, please submit an issue at:  
[https://github.com/mukteshwar845/KEYRUSH-3D/issues](https://github.com/mukteshwar845/KEYRUSH-3D/issues)
