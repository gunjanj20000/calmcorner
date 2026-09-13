# Calm Corner (PWA) 🪷

A beautiful, calming, touch-first Progressive Web App designed specifically for a 12-year-old nonverbal autistic child.

## Key Features

- **Sensory-First Design**: Zero advertisements, zero logins, zero text-heavy screens, zero failure states or competitive game loops.
- **Touch-First & High Accessibility**: Generous touch targets (>60px), multi-touch canvas interactions, prevents accidental zooming and pull-to-refresh scrolling.
- **100% Offline PWA**: Works entirely offline after the first visit with a dedicated Service Worker and Web App Manifest.
- **Installable Full-Screen**: Standalone display mode for iPad/iPhone (Safari) and Android (Chrome/Edge).
- **Zero-Latency Web Audio API**: Procedurally synthesized soothing sounds (soft bubble pops, water drops, pentatonic chimes, white/pink noise rain, ocean waves, birds, forest breeze, 432Hz ambient tones, and bells) with no external audio dependencies.

---

## 8 Activities

1. **🫧 Bubbles**: Floating iridescent bubbles that pop into soft shimmering droplets on touch, with gentle pitch-varied pops.
2. **🌊 Water**: Full-screen 2D wave equation water ripple simulation. Supports multi-finger ripples and gentle water droplet audio.
3. **✨ Magic Touch**: Highly responsive glowing particle streams with 5 gentle effect modes (Stars, Circles, Trails, Petals, Sparkles) and soothing pentatonic chimes.
4. **🎨 Draw**: Full-screen finger drawing with soft pastel colors, chunky brushes, eraser, undo, and an accidental-wipe-proof hold-to-clear button.
5. **🪲 Fireflies**: Dark twilight meadow with slowly drifting bioluminescent fireflies that glow brighter and flutter around fingers.
6. **🪶 Floating**: Drifting feathers, leaves, balloons, stars, and clouds that children can gently grab, drag, and fling with soft inertia.
7. **🎵 Sounds**: 6 procedural calming soundscapes (Rain, Ocean, Birds, Forest, Soft Tones, Gentle Bells) with an animated breathing visualizer.
8. **❤️ Favorites**: Curated view showing only the child's favorite activities to prevent choice overload.

---

## Parent Settings (Protected Gate)

Access settings via the gear icon in the top right. Protected by a **3-second hold parent gate** to prevent accidental child interactions:
- **Animation Speed**: Slow (recommended for calm engagement), Medium, Fast.
- **Master Sound Volume & On/Off Toggle**.
- **Touch Haptic Vibration On/Off**.
- **Reduce Motion** (for vestibular sensitivity).
- **Themes**: Soft Daylight, Twilight, and Midnight Dark.
- **Favorite Activities**: Select which activities appear on the Favorites screen.
- **Visible Activities**: Enable or disable specific activities based on sensory diet.
- **Session Timer**: Gentle 10, 15, 20, or 30-minute timer that transitions to a soothing rest screen without startling alarms.
- **PWA Installation Guide**: Clear walkthrough for iOS Safari and Android Chrome.

---

## Running Locally

```bash
# Inside /home/ubuntu/.gemini/antigravity-cli/scratch/calm-corner
npm run dev
# Or to preview production build:
npm run preview
```
