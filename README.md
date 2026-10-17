# 🦖 NEAT T-Rex Runner v3

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![Python 3.8+](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![NEAT-Python](https://img.shields.io/badge/AI-NEAT--Python-success.svg)](https://neat-python.readthedocs.io/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-The%20Joyboy%20Labs-00ffcc.svg)](https://the-joyboy-labs.github.io/neat-dino.html)
[![Joyboy Lab](https://img.shields.io/badge/Organization-Joyboy%20Lab-ea580c.svg)](#author--credits)

**Created by Ujjal Saha — Part of the Joyboy Lab**  
🌐 **Live Interactive Web Visualizer:** [https://the-joyboy-labs.github.io/neat-dino.html](https://the-joyboy-labs.github.io/neat-dino.html)  
📦 **GitHub Repository:** [https://github.com/ujjal-saha/offline-dino-ai-play](https://github.com/ujjal-saha/offline-dino-ai-play)

A neuroevolution AI agent (using **NEAT — NeuroEvolution of Augmenting Topologies**) that learns to master the Chrome Offline T-Rex Runner game. Built on top of the authentic Chromium sprite sheet, scrolling horizon, and multi-box collision system (`t-rex-runner-v2`), with **strict bird-ducking physics** and **dual-runtime support** (both **Python/Pygame** and **HTML5 Canvas/JavaScript**).

---

## ✨ Key Highlights & What's New in v3

1. **Authentic Chromium T-Rex Runner Sprites & Multi-Box Hitboxes:**
   - Renders directly from the official Chromium `100-offline-sprite.png` / `200-offline-sprite.png` sprite sheets: animated running, blinking, jumping, ducking, and crashed T-Rex frames, 1–3 cactus clusters, flapping Pterodactyls, scrolling bumpy horizon, clouds, and sprite-sheet distance meter (`HI 00000`).
   - Implements the exact multi-box Axis-Aligned Bounding Box (`CollisionBox`) collision engine from Chromium.

2. **True Bird-Ducking Physics (No Jumping Over Flying Birds):**
   - In many simplified Dino clones, the jump arc is high enough for the AI to jump right over flying birds without ever learning to duck, or the AI exploits simultaneous jump+duck inputs to stay permanently crouched.
   - **In v3:**
     - **Flying Pterodactyls (`ptero`)** fly at head-height (`yPos = 70–75` on the `600×150` logical canvas) with an **upper airspace collision barrier** (`CollisionBox(4, -80, 38, 92)`).
     - **Standing upright (`y = 94..137`)** collides with the bird's head/body (`y = 98..103`) $\rightarrow$ **Crash!**
     - **Jumping (`y < 93`)** collides with the bird's upper airspace $\rightarrow$ **Crash! (Jumping over birds is impossible.)**
     - **Ducking (`y = 112..137`)** lowers the T-Rex hitbox below `y = 103` $\rightarrow$ **Passes cleanly underneath!**
     - **Mutually Exclusive Ground Actions:** The T-Rex cannot initiate a jump while ducking, and training penalizes crouching when no bird is ahead—so the AI runs upright normally, jumps over cacti, ducks under flying birds, and immediately stands back up.

3. **100% Validated Pretrained Champion (`dino_best_genome.pickle` & `best_genome_v3.json`):**
   - After each generation, `Validator` tests the top genome on **30 brand-new unseen random courses** (6,000 frames / 100 seconds each).
   - Tested across **100 unseen courses**, the included v3 champion survives **100 / 100 courses (`100%`)** with **`0.0` unnecessary ground-duck frames**.

---

## 🧠 Neural Network Architecture (Generation 58 Champion — Fitness `1212.33`)

```text
Inputs (7 Normalized Sensors, scaled ×3.0)       Hidden Nodes        Outputs (tanh > 0.5)
──────────────────────────────────────────       ────────────        ────────────────────
-1: dx      (distance to next obstacle / 600) ──┐
-2: width   (obstacle width / 100)            ──┼──► [ Node 23  ] ──► 0: JUMP (Cacti)
-3: bottom  (clearance above ground / 100)    ──┤
-4: top     (obstacle top height / 100)       ──┼──► [ Node 709 ]
-5: speed   (world.speed / 13.0)              ──┤
-6: dino.h  (feet height above ground / 100)  ──┼──► [ Node 859 ] ──► 1: DUCK (Birds & Fast-Drop)
-7: dino.vy (upward velocity / 12.0)          ──┘
```

| Obstacle Type | `bottom` (Clearance) | `top` (Height) | Standing | Jumping | Ducking | Required AI Action |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Small Cactus (1–3)** | `0.00` | `0.35` | ❌ Crash | ✅ Clear | ❌ Crash | **JUMP** |
| **Large Cactus (1–2)** | `0.00` | `0.50` | ❌ Crash | ✅ Clear | ❌ Crash | **JUMP** |
| **Flying Bird (`ptero`)** | `0.37 – 0.42` | `0.65 – 0.70` | ❌ Crash | ❌ Crash *(Blocked)* | ✅ Clear | **DUCK** |

---

## 🚀 Getting Started (Python / Pygame)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Watch the Pretrained v3 AI Play
```bash
python dino_game.py --play
```

### 3. Train a New NEAT Neural Network
```bash
# Train with a live Pygame window (watch 100 dinos learn simultaneously)
python dino_game.py

# Or train headless at full CPU speed (validates in seconds)
python dino_game.py --headless
```

**Optional CLI Flags:**
```bash
python dino_game.py --headless --generations 100 --episodes 3 --max-frames 6000 --seed 7 --plot
```

### 4. Play Manually (Human Mode)
```bash
python dino_game.py --human
```

### Window Controls
| Key | Action |
| :---: | :--- |
| **`Space` / `↑`** | Jump *(Human mode)* |
| **`↓`** | Duck under birds / Fast-drop in mid-air *(Human mode)* |
| **`L`** | Toggle debug hitboxes (green/red multi-boxes, orange bird barrier, sensor line) |
| **`F`** | Toggle fast-forward (`60 FPS` $\leftrightarrow$ uncapped speed) |
| **`Esc`** | Quit (saves the best genome found so far if training) |

---

## 🌐 Getting Started (Web HTML5 / JS Dashboard)

If using the full web package (`index.html`), either open **`index.html`** directly in your browser or run a local server:

```bash
python -m http.server 8080
```
Then open `http://localhost:8080`:
- **🤖 AI Play (Pretrained v3):** Watch the validated v3 champion play with a real-time **Neural Network Graph Visualizer**.
- **🧬 Train NEAT (100 Dinos):** Watch 100 semi-transparent T-Rexes evolve live on the HTML5 canvas.
- **🎮 Human Play:** Play manually with keyboard controls.
- **Debug Hitboxes (`L`) & Sim Speed (`F`):** Inspect hitboxes and accelerate training up to `20x`.

---

## 📁 Repository Structure

```text
├── assets/
│   ├── default_100_percent/100-offline-sprite.png   # 1x Chromium sprite sheet
│   └── default_200_percent/200-offline-sprite.png   # 2x HiDPI Chromium sprite sheet
├── css/style.css                                    # Web dashboard & runner styles
├── js/script.js                                     # Web Runner engine + NEAT trainer & visualizer
├── index.html                                       # Standalone interactive web app
├── dino_game.py                                     # Python Pygame + NEAT trainer, validator & replay
├── config-dino.txt                                  # NEAT-Python hyperparameters
├── dino_best_genome.pickle                          # Pretrained v3 champion genome (Python pickle)
├── best_genome_v3.json                              # Pretrained v3 champion genome (portable JSON)
├── requirements.txt                                 # Python dependencies
├── LICENSE                                          # MIT License
└── README.md                                        # Documentation
```

---

## 👤 Author & Credits

* **Creator:** **Ujjal Saha**
* **Lab / Organization:** **Joyboy Lab**
* **License:** Licensed under the [MIT License](LICENSE) — `Copyright (c) 2026 Ujjal Saha (Joyboy Lab)`.
