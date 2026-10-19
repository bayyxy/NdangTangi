# Design Direction - NdangTangi (Wake-Up Alarm & Challenges)

## Identity & Voice
- **App**: NdangTangi ("Ndang Tangi!" - Hurry up and wake up!)
- **Target Audience**: Sleepy mobile users who need a firm, engaging nudge to get out of bed.
- **Tone**: Playful & cheeky with an arcade game edge. Firm, humorous Indonesian morning alerts (e.g. "Ayo melek!", "Ojo turu maneh!", "Nyawa wis kumpul durung?", "Masa kalah karo kasur?").
- **Dials**: ENERGY 3 / RHYTHM 2 / MOTION 2
- **Design Read**: Interactive wake-up challenge screens for sleepy mobile users, in a Bold Industrial / Tactical Arcade style, dial ENERGY 3 / RHYTHM 2 / MOTION 2.

## Palette
- **Deep Background**: `#0A0A0E` (Obsidian dark base)
- **Surface / Card**: `#14141E` (Tactical dark slate)
- **Elevated Surface**: `#1C1C2B` (Raised control surface)
- **Primary Wake Accent**: `#FF5500` (High-octane fiery amber)
- **Success / Clear**: `#10B981` (Vibrant emerald clear)
- **Danger / Urgent / Penalty**: `#EF4444` (Vivid alarm crimson)
- **Text Primary**: `#FFFFFF` (High contrast pure white)
- **Text Secondary / Muted**: `#94A3B8` (Slate grey, WCAG AA compliant >= 4.5:1 on dark surfaces)
- **Border / Structure**: `#262638` (Chunky tactical frame)

## Typography & Hierarchy
- Heavy, crisp geometric headers (`fontWeight: '900'` / `'800'`)
- Clean high-legibility tabular figures for time counters and combo stats
- Tactical labels with clear uppercase badge styling (`letterSpacing: 1.5`, `'800'`)

## Components & Layout (Alarm Ringing & Challenges)
- **Alarm Ringing Screen**:
  - Dramatic clock display with live pulsating alarm status.
  - Dynamic cheeky Indonesian status badges.
  - Tactical challenge hub container with arcade score/progress header.
  - Clear snooze option if enabled with remaining count.
- **Tap Challenge ("Ketuk Target")**:
  - Arcade target nodes with concentric rings, target counter, and combo streak feedback.
  - Visual ripple effects, countdown/progress indicator.
  - Clear mis-tap penalty flash and feedback.
- **Swipe Challenge ("Geser Pola")**:
  - Tactical directional swipe pad with glowing gesture feedback.
  - Clear directional step indicators (breadcrumbs showing completed vs upcoming swipes).
  - Smooth pan gesture tracking with visual directional guide arrows.
- **Shake Challenge ("Guncang HP")**:
  - Kinetic accelerometer energy gauge (turbo meter) that charges up as user shakes vigorously.
  - High-intensity visual shake meter with dynamic warning feedback if shaking stops.
