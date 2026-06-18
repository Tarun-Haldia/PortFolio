# Tarun Haldia — Portfolio

Deep space / sci-fi themed AI/ML portfolio with 3 interactive ML demos.

## 🚀 Deploy


### Vercel (recommended — free, instant)
1. Push this folder to GitHub
2. Go to vercel.com → "New Project" → import the repo
3. Leave all defaults → click Deploy
4. Done! Live in ~30 seconds.

### Netlify
1. Push to GitHub
2. netlify.com → "Add new site" → "Import from Git"
3. Build command: leave empty
4. Publish directory: `.` (root)
5. Deploy!

### Render (Static Site)
1. render.com → "New" → "Static Site"
2. Connect GitHub repo
3. Publish directory: `.`
4. Deploy!

## 📁 File Structure

```
tarun-portfolio/
├── index.html          ← Main HTML (edit content here)
├── css/
│   └── style.css       ← All styles (edit design here)
├── js/
│   ├── bg.js           ← Starfield background animation
│   ├── nav.js          ← Navbar scroll + mobile menu
│   ├── reveal.js       ← Scroll reveal animations
│   └── ml-demo.js      ← All 3 ML challenge demos
├── vercel.json         ← Vercel config
└── README.md
```

## ✏️ Easy Customisations

| What to change | Where |
|---|---|
| Name, bio, links | `index.html` — search the section |
| Colors / fonts | `css/style.css` — `:root` variables at top |
| New project card | Copy an `<article class="project-card">` block in `index.html` |
| ML demo tweaks | `js/ml-demo.js` — each demo is clearly sectioned |
| Add a new section | Add HTML in `index.html` + style in `style.css` |
| Profile photo | Add `<img>` tag in the hero section of `index.html` |

## 🎨 Color Tokens (css/style.css)

```css
--ion:    #3b82f6   /* primary blue */
--nova:   #a78bfa   /* purple accent */
--plasma: #60a5fa   /* light blue */
--cyan:   #22d3ee   /* highlight */
```

## 🤖 ML Demos

- **TSP**: Click cities to build your route, then AI solves with Nearest Neighbour + 2-opt improvement
- **Pattern Recognition**: 6 sequences from simple to prime numbers — guess first, then AI reveals
- **Maze BFS**: Navigate with Arrow Keys / WASD, then watch BFS find the optimal path
