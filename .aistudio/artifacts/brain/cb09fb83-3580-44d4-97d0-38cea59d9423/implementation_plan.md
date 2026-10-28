# Implementation Plan: Instagram Mobile Layout, Security Clean-up & AI Proof Verification

## Overview
Transform Cathedral High School Lost & Found by securing faculty credentials, redesigning the mobile phone layout into an Instagram-inspired swipeable card experience while preserving desktop view, completely removing "Report Lost Item" for students, making photo proof mandatory with dual-layer AI detection, and removing the "Additional Notes" field.

---

## User-Facing Proposed Changes

### 1. Remove Sample Credentials & Secure Faculty Code
- **Role Select Screen & Login Modal**:
  - Remove all sample credential quick-fill cards, prefilled demo pills, and visible faculty code disclosures (`CHS-2026`).
  - Update all input placeholders and help hints to show clean examples:
    - Email placeholder: `chs@gmail.com`
    - Faculty code placeholder: `1234`
  - Teachers can log in or register with their real faculty credentials without sensitive codes shown in the UI.

### 2. Instagram-Style Mobile Experience (Desktop Unchanged)
- **Responsive Distinction**:
  - **Desktop / Tablet (`md:` and above)**: Preserve existing grid layout, header navigation, filters, and sidebar intact.
  - **Mobile Phone (`< md`)**:
    - **Header**: Minimalist Instagram-style top bar with Cathedral High School crest/logo, current class badge, and direct notifications bell.
    - **Full-Screen Card Carousel**: Swipe left/right between found-item cards with smooth touch gestures (`onTouchStart`, `onTouchMove`, `onTouchEnd`) and card indicator dots (`1 / 8`).
    - **Post Card Style**: Square high-resolution item image, heart/save interaction, days-unclaimed tag, location badge, item name & category, and prominent **"Claim This Item"** button.
    - **Bottom App Bar**: Fixed Instagram-like bottom bar with icons:
      - 🏠 *Feed* (Lost & Found Swipe Carousel)
      - 🔍 *Search & Filter* (Quick search & category pills)
      - 🎁 *Donations* (Donations carousel & request flow)
      - 📋 *My Claims* (Track student claims)
      - 👤 *Profile* (Class switcher & account info)

### 3. Remove "Report Lost Item" for Students
- Remove "Report Lost Item" from navigation menus (`Navbar.tsx` and mobile bottom bar).
- Remove "Report Lost Item" call-to-actions, hero banners, and buttons from `HomeView.tsx` and `LostFoundView.tsx`.
- Disable student access to lost reporting: only teachers can log and publish found items.
- Remove redundant lost report components/routes for students while preserving student claim tracking under "My Claims".

### 4. Mandatory Photo Proof & Remove "Additional Notes"
- **Claim Modal Updates**:
  - Remove "Additional Notes / Circumstances" field entirely.
  - Keep core proof inputs: Description of secret identifying marks and Mandatory Photo Upload.
  - Make photo proof strictly required: the claim cannot be submitted without an uploaded clear photograph of the student's item or proof of ownership.

### 5. Dual-Layer AI Photo Verification
- **Layer 1: Instant Client-Side Metadata & File Inspection**:
  - Detect common synthetic image markers, metadata strings, and prompt signatures (e.g., Midjourney, DALL-E, Stable Diffusion, Bing Image Creator, ComfyUI, Adobe Firefly, Canvas synthetic tags).
- **Layer 2: Server-Side Gemini Vision AI Verification (`/api/verify-photo`)**:
  - Analyze the uploaded image using Gemini Vision to verify if it is a real physical photograph of an item vs. an AI-generated/rendered image or deepfake.
  - Immediate visual badge: "Authentic Photo Verified" or rejection warning if AI generation artifacts/synthetic patterns are identified.

---

## Verification Plan

### Automated Build & Syntax Checks
- Run `tsc --noEmit` to verify TypeScript types across all modified components.
- Run `compile_applet` to ensure Vite development bundle compiles cleanly.

### Manual Verification Scenarios
1. **Credentials Cleanliness**:
   - Open initial landing screen; ensure zero sample credential buttons or actual faculty codes are visible. Confirm placeholders display `chs@gmail.com` and `1234`.
2. **Mobile Instagram Viewport**:
   - Inspect mobile viewport (< 768px): verify swipeable horizontal card deck, swipe transitions, and bottom navigation bar.
   - Verify desktop viewport (>= 768px): verify classic lost & found grid, full navbar, and filters remain unchanged.
3. **Student Flow (No Lost Report)**:
   - Sign in as student. Confirm "Report Lost Item" is absent from navigation, home page, and lost & found views.
4. **Mandatory Photo & AI Detection**:
   - Open "Claim This Item". Ensure "Additional Notes" is gone.
   - Attempt submission without a photo: confirm validation blocks submission.
   - Test image upload: confirm instant metadata and AI verification inspects the photo.
