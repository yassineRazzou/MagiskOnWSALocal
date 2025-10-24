# Talaje Visual Prototype

This directory contains a responsive, casino-inspired front-end prototype for **Talaje**, a 2v2 Moroccan Rami game. It is a static build that can be opened directly in a browser for design reviews before wiring multiplayer logic.

## Getting Started

Open `index.html` in any modern browser. Use the control buttons to simulate shuffling, dealing, sorting your hand, and rotating the active seat highlight.

## Prototype Highlights

- Authentic top-down table layout with four player seats, stock/discard piles, and indicator card.
- Animated card stacks, hover effects, and seat highlighting to hint at future interactivity.
- Implements key Talaje rules visually: 71-point Talaje reminder and the "Joke 2" wild-card rotation based on the indicator card colour.
- Modular HTML structure (`Table`, `Player`, `Pile`) and TypeScript-ready JavaScript (`script.js`) crafted for an eventual React port.

Replace the placeholder audio clips in `sounds/` with real effects when assets are available.
