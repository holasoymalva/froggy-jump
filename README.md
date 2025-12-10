# 🐸 Froggy Jump 3D

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)
![Status](https://img.shields.io/badge/status-live-success.svg?style=for-the-badge)

> *Dive into an infinite isometric adventure where every jump counts.*

**Froggy Jump 3D** is a premium hyper-casual gaming experience designed to test your reflexes and timing. Built with state-of-the-art WebGL technology via **Three.js**, this game delivers a buttery-smooth, procedurally generated world right in your browser. Whether you're on a desktop or mobile device, prepare for an addictive journey across ever-changing waters.

---

## 🎮 Play Now

Experience the game directly in your browser:
**[Launch Froggy Jump 3D](https://holasoymalva.github.io/froggy-jump/)**

---

## ✨ Key Features

*   **Isometric 3D World**: A stunningly rendered low-poly environment with dynamic lighting and soft shadows.
*   **Procedural Generation**: No two runs are the same! The path is generated in real-time as you progress, offering infinite replayability.
*   **Dynamic Day/Night Cycles**: Immerse yourself in four distinct atmospheric themes that change with every game:
    *   ☀️ **Day**: crisp blue skies and lush greens.
    *   🌙 **Night**: mysterious dark waters and moonlit paths.
    *   🌅 **Sunset**: warm orange hues and relaxing vibes.
    *   🔮 **Magic**: ethereal purples and enchanted tones.
*   **Responsive Controls**: optimized for both touch (mobile) and keyboard (desktop) for a seamless experience.
*   **Silky Smooth Performance**: Highly optimized rendering loop ensuring 60 FPS across most devices.

## 🕹️ How to Play

The goal is simple: Jump as far as you can without falling into the water!

### Desktop Controls
*   **Arrow Left / Right**: Jump diagonally to change lanes.
*   **Arrow Up**: Jump forward.

### Mobile / Touch Controls
*   **Tap Left Side**: Jump Left.
*   **Tap Right Side**: Jump Right.
*   **Tap Center**: Jump Forward.

---

## 🛠️ Technology Stack

This project showcases the power of modern web technologies without the bloat of heavy game engines.

| Technology | Purpose |
| :--- | :--- |
| **Three.js** | Core 3D Rendering Engine & Scene Management |
| **WebGL** | Hardware-accelerated graphics |
| **Vanilla JavaScript (ES6+)** | Game Logic & State Management |
| **HTML5 & CSS3** | HUD Interface & Responsive Layouts |
| **Vite / Local Server** | Development Environment |

## 🚀 Installation & Development

Want to run this locally or contribute? Follow these simple steps:

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/holasoymalva/froggy-jump.git
    cd froggy-jump
    ```

2.  **Run Locally**
    Since this project uses ES Modules, you need a local server.
    
    *   **Using Python:**
        ```bash
        python3 -m http.server
        ```
    *   **Using Node/NPM (http-server):**
        ```bash
        npx http-server .
        ```
    *   **Using VS Code:**
        Simply open with the **Live Server** extension.

3.  **Open in Browser**
    Navigate to `http://localhost:8000` (or whatever port your server uses) to start playing.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ and 🐸 by <a href="https://github.com/holasoymalva">holasoymalva</a>
</p>