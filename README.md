# 🎮 2048 Game — Human vs AI Agent

A beautifully designed and functional version of the classic [2048 game](https://play2048.co/), enhanced with both **Human Play Mode** and an **AI Agent (Expectimax)** that plays the game automatically!

Built entirely using **HTML**, **CSS (Tailwind)**, and **JavaScript** — no frameworks required.

---

## 🚀 Features

- 🎯 **Play as Human** — Use keyboard arrow keys or swipe gestures.
- 🤖 **Watch AI Play** — Powered by a smart **Expectimax algorithm** with adaptive depth.
- ⚡ **Turbo Mode** — Let the AI go beast mode with fast decision-making.
- 🔁 **Undo Feature** (for human mode).
- 📈 **Score Tracking** — With Best Score saved using `localStorage`.
- 🎨 Responsive UI with clean tile animations and dynamic styles.

---

## 📽️ Gameplay Preview

Open `results.mov` to preview gameplay in action!

---

## 📁 File Structure


📂 project-folder/
├── index.html # Main HTML file (structure only)
├── style.css # Tile styles, transitions, animations
├── script.js # All game logic, input handling, and AI agent
└── results.mov # Gameplay video preview

---

## 🧠 About the AI Agent

The AI uses the **Expectimax algorithm**, which:
- Simulates possible game states
- Applies a **heuristic scoring function** that values:
  - Empty tiles
  - Smoothness
  - Merge potential
  - Corner tile bonus
  - Weighted positions
- Dynamically adjusts search **depth** based on board complexity

It chooses moves that **maximize expected future score** — just like a real strategy player.

---

## 🕹️ How to Play

### Human Mode:
- Press `Play as Human`
- Use **Arrow Keys** on desktop
- Or **Swipe** on mobile/touch devices

### AI Mode:
- Press `Watch AI Play`
- Enable **Turbo Mode** if you want rapid decisions

---

## 🛠️ Tech Stack

- **HTML5**
- **Tailwind CSS**
- **Vanilla JavaScript**
- **Remix Icon CDN**

---

## 📦 Installation & Usage


```bash
git clone https://github.com/your-username/2048-ai-game.git
cd 2048-ai-game
# Then just open index.html in your browser
Or just double-click the index.html file in your system.

---




