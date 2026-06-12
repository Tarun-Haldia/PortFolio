/* ═══════════════════════════════════════════════════
   ml-demo.js  —  Machine vs Human Challenges
   Three demos showing why algorithms beat human brains:
   1. Travelling Salesman (Nearest Neighbour + 2-opt)
   2. Number Pattern Recognition (polynomial fitting)
   3. Maze Solver (Breadth-First Search)
═══════════════════════════════════════════════════ */

/* ── TAB SWITCHING ── */
document.querySelectorAll('.demo-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.demo-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.demo-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

/* ══════════════════════════════════════════════════
   1. TRAVELLING SALESMAN PROBLEM
   ─ User clicks to add cities & build a route
   ─ AI solves with Nearest-Neighbour + 2-opt
══════════════════════════════════════════════════ */
const tspCanvas = document.getElementById('tspCanvas');
const tspCtx = tspCanvas.getContext('2d');

const TSP = {
  cities: [],
  humanRoute: [],
  aiRoute: [],
  humanComplete: false,
  animating: false,
  animStep: 0,
  animTimer: null,

  init() {
    this.cities = [];
    this.humanRoute = [];
    this.aiRoute = [];
    this.humanComplete = false;
    this.animating = false;
    clearInterval(this.animTimer);
    this.randomCities(10);
    this.log('Click canvas to add cities, or use the random set. Build your route by clicking cities in order, then hit Solve.');
    this.updateStats();
    this.draw();
  },

  randomCities(n) {
    const pad = 40;
    for (let i = 0; i < n; i++) {
      this.cities.push({
        x: pad + Math.random() * (tspCanvas.width  - pad * 2),
        y: pad + Math.random() * (tspCanvas.height - pad * 2)
      });
    }
  },

  dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  },

  routeLength(route) {
    if (route.length < 2) return 0;
    let d = 0;
    for (let i = 0; i < route.length - 1; i++) d += this.dist(this.cities[route[i]], this.cities[route[i+1]]);
    d += this.dist(this.cities[route[route.length-1]], this.cities[route[0]]);
    return d;
  },

  nearestNeighbour() {
    const n = this.cities.length;
    const visited = new Array(n).fill(false);
    const route = [0];
    visited[0] = true;
    while (route.length < n) {
      const last = route[route.length - 1];
      let best = -1, bestD = Infinity;
      for (let i = 0; i < n; i++) {
        if (!visited[i]) {
          const d = this.dist(this.cities[last], this.cities[i]);
          if (d < bestD) { bestD = d; best = i; }
        }
      }
      route.push(best);
      visited[best] = true;
    }
    return route;
  },

  twoOpt(route) {
    let improved = true;
    let best = [...route];
    while (improved) {
      improved = false;
      for (let i = 1; i < best.length - 1; i++) {
        for (let k = i + 1; k < best.length; k++) {
          const newRoute = [...best.slice(0, i), ...best.slice(i, k+1).reverse(), ...best.slice(k+1)];
          if (this.routeLength(newRoute) < this.routeLength(best)) {
            best = newRoute;
            improved = true;
          }
        }
      }
    }
    return best;
  },

  solve() {
    if (this.cities.length < 3 || this.animating) return;
    const nn = this.nearestNeighbour();
    this.aiRoute = this.twoOpt(nn);
    this.animating = true;
    this.animStep = 0;
    clearInterval(this.animTimer);
    this.animTimer = setInterval(() => {
      this.animStep++;
      this.draw();
      if (this.animStep >= this.aiRoute.length) {
        clearInterval(this.animTimer);
        this.animating = false;
        this.updateStats();
      }
    }, 60);
  },

  handleClick(e) {
    if (this.animating) return;
    const rect = tspCanvas.getBoundingClientRect();
    const scaleX = tspCanvas.width  / rect.width;
    const scaleY = tspCanvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;

    if (this.humanComplete) return;

    // Click near existing city → add to human route
    const radius = 18;
    for (let i = 0; i < this.cities.length; i++) {
      if (Math.hypot(this.cities[i].x - mx, this.cities[i].y - my) < radius) {
        if (this.humanRoute.includes(i)) return;
        this.humanRoute.push(i);
        if (this.humanRoute.length === this.cities.length) {
          this.humanComplete = true;
          this.log(`Your route complete! Length: ${this.routeLength(this.humanRoute).toFixed(0)}px. Now hit ⚡ Solve to see AI do better.`);
          this.updateStats();
        } else {
          this.log(`Added city ${i+1}. ${this.cities.length - this.humanRoute.length} cities remaining.`);
        }
        this.draw();
        return;
      }
    }
  },

  updateStats() {
    const hd = this.humanRoute.length === this.cities.length ? this.routeLength(this.humanRoute).toFixed(0)+'px' : '—';
    const ad = this.aiRoute.length > 0 ? this.routeLength(this.aiRoute).toFixed(0)+'px' : '—';
    document.getElementById('tsp-human-dist').textContent = hd;
    document.getElementById('tsp-ai-dist').textContent = ad;
    if (this.humanRoute.length === this.cities.length && this.aiRoute.length > 0) {
      const pct = (((this.routeLength(this.humanRoute) - this.routeLength(this.aiRoute)) / this.routeLength(this.humanRoute)) * 100);
      document.getElementById('tsp-improve').textContent = pct > 0 ? `${pct.toFixed(1)}% shorter` : 'Optimal!';
    } else {
      document.getElementById('tsp-improve').textContent = '—';
    }
  },

  log(msg) {
    document.getElementById('tsp-log').textContent = msg;
  },

  draw() {
    const ctx = tspCtx;
    ctx.clearRect(0, 0, tspCanvas.width, tspCanvas.height);

    // AI route (animated)
    if (this.aiRoute.length > 1) {
      const steps = Math.min(this.animStep, this.aiRoute.length);
      ctx.beginPath();
      ctx.moveTo(this.cities[this.aiRoute[0]].x, this.cities[this.aiRoute[0]].y);
      for (let i = 1; i < steps; i++) {
        ctx.lineTo(this.cities[this.aiRoute[i]].x, this.cities[this.aiRoute[i]].y);
      }
      if (steps === this.aiRoute.length) {
        ctx.lineTo(this.cities[this.aiRoute[0]].x, this.cities[this.aiRoute[0]].y);
      }
      ctx.strokeStyle = 'rgba(34,197,94,0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.stroke();
    }

    // Human route
    if (this.humanRoute.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.cities[this.humanRoute[0]].x, this.cities[this.humanRoute[0]].y);
      for (let i = 1; i < this.humanRoute.length; i++) {
        ctx.lineTo(this.cities[this.humanRoute[i]].x, this.cities[this.humanRoute[i]].y);
      }
      if (this.humanComplete) {
        ctx.lineTo(this.cities[this.humanRoute[0]].x, this.cities[this.humanRoute[0]].y);
      }
      ctx.strokeStyle = 'rgba(245,158,11,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Cities
    this.cities.forEach((c, i) => {
      const inHuman = this.humanRoute.includes(i);
      const inAI = this.aiRoute.length > 0;
      const isFirst = this.humanRoute[0] === i;

      // Glow
      const grd = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 14);
      grd.addColorStop(0, 'rgba(59,130,246,0.3)');
      grd.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(c.x, c.y, 14, 0, Math.PI*2);
      ctx.fillStyle = grd; ctx.fill();

      // Circle
      ctx.beginPath(); ctx.arc(c.x, c.y, 7, 0, Math.PI*2);
      ctx.fillStyle = inHuman ? '#f59e0b' : '#3b82f6';
      if (isFirst) ctx.fillStyle = '#22c55e';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 9px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(i + 1, c.x, c.y + 3.5);
    });
  }
};

TSP.init();
tspCanvas.addEventListener('click', e => TSP.handleClick(e));
document.getElementById('tsp-solve-btn').addEventListener('click', () => {
  if (!TSP.humanComplete) {
    TSP.log('Tip: build your own route first for a fairer comparison! Solving anyway…');
  }
  TSP.solve();
});
document.getElementById('tsp-reset-btn').addEventListener('click', () => TSP.init());


/* ══════════════════════════════════════════════════
   2. PATTERN RECOGNITION
   ─ Sequences of increasing complexity
   ─ Human guesses → AI reveals polynomial fit
══════════════════════════════════════════════════ */
const SEQUENCES = [
  {
    label: 'Quadratic Growth',
    formula: 'n²',
    values: [1, 4, 9, 16, 25, 36, 49],
    explanation: 'n² — perfect squares. The machine notices the second difference is constant (2), which means quadratic.'
  },
  {
    label: 'Fibonacci-like',
    formula: 'a(n) = a(n-1) + a(n-2)',
    values: [1, 1, 2, 3, 5, 8, 13, 21, 34],
    explanation: 'Each term = sum of previous two. The machine fits the ratio converging to φ (1.618…).'
  },
  {
    label: 'Mixed: n² + 3n',
    formula: 'n² + 3n',
    values: [4, 10, 18, 28, 40, 54, 70],
    explanation: 'n² + 3n. Two rules combined — most humans guess linear, missing the quadratic component entirely.'
  },
  {
    label: 'Alternating Powers',
    formula: '(-1)ⁿ · n²',
    values: [-1, 4, -9, 16, -25, 36, -49],
    explanation: 'Alternating sign with squared magnitude. The sign pattern is the hidden rule humans often overlook.'
  },
  {
    label: 'Prime Gaps',
    formula: 'pₙ (prime numbers)',
    values: [2, 3, 5, 7, 11, 13, 17, 19, 23],
    explanation: 'Prime numbers — no closed formula exists! Even ML must memorise or use a sieve. Some patterns have no rule.'
  },
  {
    label: 'Triangular + offset',
    formula: 'n(n+1)/2 + 2',
    values: [3, 5, 8, 12, 17, 23, 30],
    explanation: 'Triangular numbers offset by +2. The differences grow linearly: 2,3,4,5,6… The machine detects this instantly.'
  }
];

const PAT = {
  idx: 0,
  revealed: false,

  current() { return SEQUENCES[this.idx]; },

  init() {
    this.revealed = false;
    const seq = this.current();
    const show = seq.values.slice(0, seq.values.length - 3);
    const hidden = seq.values.slice(seq.values.length - 3);

    // Left panel log
    document.getElementById('pattern-log').textContent =
      `Sequence: "${seq.label}" — Guess the next 3 numbers, then let AI reveal the pattern.`;

    // Right panel display
    const display = document.getElementById('pattern-display');
    display.innerHTML = '';

    // Known numbers row
    const knownRow = document.createElement('div');
    knownRow.className = 'pattern-row';
    knownRow.innerHTML = `<div class="pattern-row-label">SEQUENCE (${seq.formula})</div><div class="pattern-numbers" id="pnum-row"></div>`;
    display.appendChild(knownRow);

    const numRow = knownRow.querySelector('#pnum-row');
    show.forEach(v => {
      const el = document.createElement('div');
      el.className = 'pnum';
      el.textContent = v;
      numRow.appendChild(el);
    });

    // Question marks
    const qmarks = document.createElement('div');
    qmarks.className = 'pnum pnum-question';
    qmarks.id = 'q-marks';
    qmarks.textContent = '? ? ?';
    numRow.appendChild(qmarks);

    // Human guess row
    const guessRow = document.createElement('div');
    guessRow.className = 'pattern-row';
    guessRow.innerHTML = `
      <div class="pattern-row-label">YOUR GUESS (next number)</div>
      <div class="pattern-input-row">
        <input type="number" id="human-guess-input" placeholder="?" />
        <button class="pattern-check-btn" id="guess-check-btn">Check</button>
      </div>
      <div id="guess-result" style="font-family:var(--font-mono);font-size:0.75rem;color:var(--mist);margin-top:0.5rem;min-height:1.2rem"></div>
    `;
    display.appendChild(guessRow);

    // AI answer (hidden)
    const aiRow = document.createElement('div');
    aiRow.className = 'pattern-row';
    aiRow.id = 'ai-answer-row';
    aiRow.style.display = 'none';
    aiRow.innerHTML = `
      <div class="pattern-row-label">AI REVEALS — next 3 numbers</div>
      <div class="pattern-numbers" id="ai-nums"></div>
      <div style="margin-top:0.75rem;font-size:0.78rem;color:var(--mist);line-height:1.65;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);border-radius:6px;padding:0.6rem 0.8rem" id="ai-explanation"></div>
    `;
    display.appendChild(aiRow);

    // Check button
    document.getElementById('guess-check-btn').addEventListener('click', () => {
      const inp = document.getElementById('human-guess-input');
      const val = parseInt(inp.value, 10);
      const correct = seq.values[show.length];
      const res = document.getElementById('guess-result');
      if (isNaN(val)) { res.textContent = 'Enter a number first.'; return; }
      if (val === correct) {
        res.style.color = 'var(--green)';
        res.textContent = `✓ Correct! That one was ${correct}.`;
      } else {
        res.style.color = '#f87171';
        res.textContent = `✗ You guessed ${val}, correct was ${correct}. Try the reveal to see the full pattern.`;
      }
    });
  },

  reveal() {
    if (this.revealed) return;
    this.revealed = true;
    const seq = this.current();
    const hidden = seq.values.slice(seq.values.length - 3);

    document.getElementById('q-marks').style.display = 'none';
    const numRow = document.getElementById('pnum-row');
    hidden.forEach(v => {
      const el = document.createElement('div');
      el.className = 'pnum pnum-ai';
      el.textContent = v;
      numRow.appendChild(el);
    });

    const aiRow = document.getElementById('ai-answer-row');
    aiRow.style.display = 'block';

    const aiNums = document.getElementById('ai-nums');
    hidden.forEach(v => {
      const el = document.createElement('div');
      el.className = 'pnum pnum-ai';
      el.textContent = v;
      aiNums.appendChild(el);
    });

    document.getElementById('ai-explanation').textContent = seq.explanation;
    document.getElementById('pattern-log').textContent =
      `AI formula: "${seq.formula}" — ${seq.label}. Hit Next Sequence to try another.`;
  },

  next() {
    this.idx = (this.idx + 1) % SEQUENCES.length;
    this.init();
  }
};

PAT.init();
document.getElementById('pattern-reveal-btn').addEventListener('click', () => PAT.reveal());
document.getElementById('pattern-next-btn').addEventListener('click', () => PAT.next());


/* ══════════════════════════════════════════════════
   3. MAZE SOLVER — BFS vs Human
   ─ Procedurally generated maze (recursive backtracker)
   ─ Human navigates with arrow keys / WASD
   ─ BFS finds guaranteed shortest path
══════════════════════════════════════════════════ */
const mazeCanvas = document.getElementById('mazeCanvas');
const mazeCtx = mazeCanvas.getContext('2d');

const MAZE = {
  ROWS: 13, COLS: 15,
  grid: [],
  playerPos: { r: 0, c: 0 },
  humanSteps: 0,
  humanVisited: new Set(),
  aiPath: [],
  aiAnimStep: 0,
  aiTimer: null,
  solved: false,
  start: { r: 0, c: 0 },
  end: { r: 12, c: 14 },

  CELL_W() { return Math.floor(mazeCanvas.width  / this.COLS); },
  CELL_H() { return Math.floor(mazeCanvas.height / this.ROWS); },

  init() {
    clearInterval(this.aiTimer);
    this.humanSteps = 0;
    this.humanVisited = new Set();
    this.solved = false;
    this.aiPath = [];
    this.aiAnimStep = 0;
    this.start = { r: 0, c: 0 };
    this.end   = { r: this.ROWS - 1, c: this.COLS - 1 };
    this.playerPos = { ...this.start };
    this.generateMaze();
    this.updateStats();
    this.log('Use Arrow Keys / WASD to navigate from S (top-left) to E (bottom-right).');
    this.draw();
  },

  key(r, c) { return `${r},${c}`; },

  generateMaze() {
    // Initialize: all walls
    this.grid = Array.from({ length: this.ROWS }, () =>
      Array.from({ length: this.COLS }, () => ({ right: true, bottom: true, visited: false }))
    );

    // Recursive backtracker DFS
    const stack = [];
    const start = { r: 0, c: 0 };
    this.grid[0][0].visited = true;
    stack.push(start);

    const dirs = [
      { dr: -1, dc: 0, wall: 'bottom', opp: 'bottom', or: -1 },
      { dr:  1, dc: 0, wall: 'bottom', opp: 'bottom', or: 0 },
      { dr:  0, dc: -1, wall: 'right', opp: 'right', oc: -1 },
      { dr:  0, dc:  1, wall: 'right', opp: 'right', oc: 0  },
    ];

    while (stack.length) {
      const { r, c } = stack[stack.length - 1];
      const neighbours = [];
      // Up
      if (r > 0 && !this.grid[r-1][c].visited) neighbours.push({ nr: r-1, nc: c, type: 'up' });
      // Down
      if (r < this.ROWS-1 && !this.grid[r+1][c].visited) neighbours.push({ nr: r+1, nc: c, type: 'down' });
      // Left
      if (c > 0 && !this.grid[r][c-1].visited) neighbours.push({ nr: r, nc: c-1, type: 'left' });
      // Right
      if (c < this.COLS-1 && !this.grid[r][c+1].visited) neighbours.push({ nr: r, nc: c+1, type: 'right' });

      const unvisited = neighbours.filter(n => !this.grid[n.nr][n.nc].visited);
      if (unvisited.length === 0) { stack.pop(); continue; }

      const next = unvisited[Math.floor(Math.random() * unvisited.length)];
      this.grid[next.nr][next.nc].visited = true;

      // Remove wall between current and next
      if (next.type === 'right') { this.grid[r][c].right = false; }
      else if (next.type === 'left') { this.grid[r][next.nc].right = false; }
      else if (next.type === 'down') { this.grid[r][c].bottom = false; }
      else if (next.type === 'up') { this.grid[next.nr][c].bottom = false; }

      stack.push({ r: next.nr, c: next.nc });
    }
  },

  canMove(r, c, dr, dc) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= this.ROWS || nc < 0 || nc >= this.COLS) return false;
    // Check wall
    if (dc === 1)  return !this.grid[r][c].right;     // moving right
    if (dc === -1) return !this.grid[r][nc].right;    // moving left
    if (dr === 1)  return !this.grid[r][c].bottom;    // moving down
    if (dr === -1) return !this.grid[nr][c].bottom;   // moving up
    return false;
  },

  movePlayer(dr, dc) {
    if (this.solved) return;
    const { r, c } = this.playerPos;
    if (!this.canMove(r, c, dr, dc)) {
      this.log('🚧 Wall! Can\'t go that way.');
      return;
    }
    this.playerPos = { r: r + dr, c: c + dc };
    this.humanSteps++;
    this.humanVisited.add(this.key(this.playerPos.r, this.playerPos.c));
    this.updateStats();

    if (this.playerPos.r === this.end.r && this.playerPos.c === this.end.c) {
      this.solved = true;
      this.log(`🎉 You solved it in ${this.humanSteps} steps! Now see how BFS does it.`);
    } else {
      const dist = Math.abs(this.end.r - this.playerPos.r) + Math.abs(this.end.c - this.playerPos.c);
      this.log(`Steps: ${this.humanSteps} | Manhattan dist to end: ${dist}`);
    }
    this.draw();
  },

  bfs() {
    const { r: sr, c: sc } = this.start;
    const { r: er, c: ec } = this.end;
    const visited = Array.from({ length: this.ROWS }, () => new Array(this.COLS).fill(false));
    const prev = Array.from({ length: this.ROWS }, () => new Array(this.COLS).fill(null));
    const queue = [{ r: sr, c: sc }];
    visited[sr][sc] = true;
    const moves = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];

    while (queue.length) {
      const { r, c } = queue.shift();
      if (r === er && c === ec) break;
      for (const { dr, dc } of moves) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= this.ROWS || nc < 0 || nc >= this.COLS) continue;
        if (visited[nr][nc]) continue;
        if (!this.canMove(r, c, dr, dc)) continue;
        visited[nr][nc] = true;
        prev[nr][nc] = { r, c };
        queue.push({ r: nr, c: nc });
      }
    }

    // Reconstruct path
    const path = [];
    let cur = { r: er, c: ec };
    while (cur) { path.unshift(cur); cur = prev[cur.r][cur.c]; }
    return path;
  },

  solve() {
    if (this.aiPath.length > 0) return;
    this.aiPath = this.bfs();
    this.aiAnimStep = 0;
    this.playerPos = { ...this.start };
    clearInterval(this.aiTimer);
    this.aiTimer = setInterval(() => {
      this.aiAnimStep++;
      this.draw();
      if (this.aiAnimStep >= this.aiPath.length) {
        clearInterval(this.aiTimer);
        this.log(`✅ BFS found shortest path: ${this.aiPath.length - 1} steps — mathematically optimal.`);
        document.getElementById('maze-ai-steps').textContent = this.aiPath.length - 1;
        this.updateStats();
      }
    }, 55);
  },

  updateStats() {
    document.getElementById('maze-human-steps').textContent = this.humanSteps;
    document.getElementById('maze-visited').textContent = this.humanVisited.size;
    if (this.aiPath.length > 0) {
      document.getElementById('maze-ai-steps').textContent = this.aiPath.length - 1;
    }
  },

  log(msg) { document.getElementById('maze-log').textContent = msg; },

  draw() {
    const ctx = mazeCtx;
    const CW = this.CELL_W(), CH = this.CELL_H();
    ctx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);

    // BFS path (animated)
    if (this.aiPath.length > 1) {
      const steps = Math.min(this.aiAnimStep, this.aiPath.length);
      this.aiPath.slice(0, steps).forEach(({ r, c }) => {
        ctx.fillStyle = 'rgba(34,197,94,0.22)';
        ctx.fillRect(c * CW + 1, r * CH + 1, CW - 2, CH - 2);
      });
    }

    // Human visited
    this.humanVisited.forEach(k => {
      const [r, c] = k.split(',').map(Number);
      ctx.fillStyle = 'rgba(245,158,11,0.12)';
      ctx.fillRect(c * CW + 1, r * CH + 1, CW - 2, CH - 2);
    });

    // Walls
    ctx.strokeStyle = 'rgba(59,130,246,0.55)';
    ctx.lineWidth = 1.5;
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const x = c * CW, y = r * CH;
        // Top wall (first row only)
        if (r === 0) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + CW, y); ctx.stroke(); }
        // Left wall (first col only)
        if (c === 0) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + CH); ctx.stroke(); }
        // Right wall
        if (this.grid[r][c].right) {
          ctx.beginPath(); ctx.moveTo(x + CW, y); ctx.lineTo(x + CW, y + CH); ctx.stroke();
        }
        // Bottom wall
        if (this.grid[r][c].bottom) {
          ctx.beginPath(); ctx.moveTo(x, y + CH); ctx.lineTo(x + CW, y + CH); ctx.stroke();
        }
      }
    }

    // End marker
    const er = this.end.r, ec = this.end.c;
    ctx.fillStyle = 'rgba(239,68,68,0.25)';
    ctx.fillRect(ec * CW + 1, er * CH + 1, CW - 2, CH - 2);
    ctx.fillStyle = '#f87171';
    ctx.font = `bold ${Math.min(CW, CH) * 0.55}px Space Mono, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', ec * CW + CW / 2, er * CH + CH / 2);

    // Start marker
    ctx.fillStyle = 'rgba(34,197,94,0.2)';
    ctx.fillRect(0 * CW + 1, 0 * CH + 1, CW - 2, CH - 2);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('S', 0 * CW + CW / 2, 0 * CH + CH / 2);

    // Player
    const pr = this.playerPos.r, pc = this.playerPos.c;
    const px = pc * CW + CW / 2, py = pr * CH + CH / 2;
    const rad = Math.min(CW, CH) * 0.32;
    const grd = ctx.createRadialGradient(px, py, 0, px, py, rad);
    grd.addColorStop(0, '#60a5fa');
    grd.addColorStop(1, '#3b82f6');
    ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fillStyle = grd; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5; ctx.stroke();
  }
};

MAZE.init();

// Keyboard navigation
window.addEventListener('keydown', e => {
  // Only handle if demo tab is active
  const tab = document.getElementById('tab-maze');
  if (!tab || !tab.classList.contains('active')) return;
  const map = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1], w:[-1,0], s:[1,0], a:[0,-1], d:[0,1] };
  const mv = map[e.key];
  if (mv) { e.preventDefault(); MAZE.movePlayer(mv[0], mv[1]); }
});

document.getElementById('maze-solve-btn').addEventListener('click', () => MAZE.solve());
document.getElementById('maze-reset-btn').addEventListener('click', () => MAZE.init());
