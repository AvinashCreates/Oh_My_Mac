# macOS Sonoma-Inspired Interactive Portfolio

A high-fidelity, fully interactive replica of the macOS Sonoma desktop — built as a personal portfolio for **Pamarthi Avinash**. Boot sequence, lock screen, a live menu bar, a draggable window manager, a working terminal, Finder, and a full app suite (Portfolio, Projects, Contact, Notes, Mail, Photos, Messages, FaceTime, Calendar, Music, Settings) all run entirely in the browser — no backend required.

## 🚀 Overview
This repository contains the source for a custom macOS-inspired environment that doubles as a portfolio site. The goal is to recreate the feel of a real Mac desktop — right down to the boot chime screen and dock magnification — while staying lightweight enough to run fluidly on modest hardware (tested on an Intel Core i3, 4th generation).

## ✨ Key Features
- **Boot & Lock Screen** — animated multilingual "hello" boot sequence, then an authentic lock screen with live clock and profile photo.
- **Window Manager** — draggable **and resizable** (drag the bottom-right corner) windows, drag-to-edge **snapping** (left/right half, top to maximize, just like macOS/Windows tiling), minimize/maximize/close with a genie effect that actually shrinks toward the real Dock icon, z-index stacking, and Alt+Tab cycling.
- **Mission Control** — press **F3** / **Ctrl+↑**, right-click the desktop, or use Control Center to see every open window at once and click to jump to it.
- **Right-click context menus** — on the desktop (New Folder, New Terminal, Change Wallpaper, Mission Control, Get Info) and on any Dock icon (Open, Quit).
- **Notifications** — real toast banners (top-right) plus a Notification Center panel (click the clock) that logs everything: notes saved, mail sent, wallpaper changed, Wi-Fi connected, and more. A Focus/Do Not Disturb toggle silences them.
- **Working Terminal** — a real zsh-style shell with custom commands (`help`, `whoami`, `skills`, `projects`, `socials`, `neofetch`, and more).
- **Finder** — a functional file browser view with categories (Recents, Documents, Desktop, Downloads, Applications).
- **App Suite** — Portfolio, Projects (TBEF research + INNOGENESIS 2026 + this desktop), Contact & Socials, Calendar with saved events, Notes (auto-saves to the browser), Mail (opens a real compose window), Photos (lightbox viewer), Messages (routes to real email), FaceTime (schedule-a-call via email), and System Settings.
- **Spotlight (⌘K)** — indexes every app and system action, not just a couple of them.
- **Persisted State** — brightness, volume, calendar events, and notes are saved with `localStorage` so they survive a refresh.
- **Performance-minded** — no heavy frameworks; plain HTML/CSS/JS plus the Tailwind CDN and Font Awesome icons.

## 🛠️ Tech Stack
- HTML5, CSS3, JavaScript (vanilla)
- [Tailwind CSS](https://tailwindcss.com/) via CDN
- [Font Awesome 6](https://fontawesome.com/) for iconography

## 📦 Installation & Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/AvinashCreates/Oh_My_Mac
   ```
2. Open `index.html` directly in a browser, or serve the folder with any static file server:
   ```bash
   npx serve .
   ```
3. Click anywhere (or press any key) to skip the boot animation, then click your avatar on the lock screen to enter the desktop.

## 📁 Project Structure
```
├── index.html   # Markup for boot screen, lock screen, menu bar, windows, dock
├── style.css    # Custom styling layered on top of Tailwind
├── script.js    # All interactive logic — window manager, terminal, apps
├── img.png      # Profile photo used on the lock screen, Settings and Photos
└── README.md
```

## ⚖️ Legal Disclaimer
This project is an independent, open-source educational concept created solely for learning, portfolio display, and interface experimentation. It is not affiliated with, authorized, maintained, sponsored, or endorsed by Apple Inc. All product names, logos, and brands are property of their respective owners.

---
Built by Pamarthi Avinash.
