// The dot system. One dot per commit, drawn on a single fixed canvas.
// The dots begin as noise and rearrange into a formation for each chapter of
// the story: a trend line, a globe, a calendar, a floor, a bonsai, one point.
//
// Written for this site. Positions are in CSS pixels; the context is scaled
// by the device pixel ratio (capped at 2).

const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const RAD = Math.PI / 180;

const mulberry32 = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const hash = (x, y) => {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** Smooth value noise in [0, 1]. */
const noise = (x, y) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

const smooth = (lo, hi, v) => {
  const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
};

/** Unit vector for a latitude and longitude in degrees. */
const toVector = (lat, lon) => {
  const p = lat * RAD;
  const l = lon * RAD;
  return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
};

/** A bonsai as a cloud of points in a unit box: pot, trunk, branches, foliage pads. */
function growBonsai(count, rand) {
  const points = [];
  const gauss = () => (rand() + rand() + rand() + rand() - 2) / 1.16;
  const bezier = (p, t) => {
    const m = 1 - t;
    return [
      m * m * m * p[0][0] + 3 * m * m * t * p[1][0] + 3 * m * t * t * p[2][0] + t * t * t * p[3][0],
      m * m * m * p[0][1] + 3 * m * m * t * p[1][1] + 3 * m * t * t * p[2][1] + t * t * t * p[3][1],
    ];
  };
  const trunk = [
    [0.5, 0.86],
    [0.33, 0.7],
    [0.66, 0.52],
    [0.47, 0.3],
  ];
  const pads = [
    { cx: 0.5, cy: 0.225, rx: 0.2, ry: 0.105, from: 1 },
    { cx: 0.765, cy: 0.46, rx: 0.165, ry: 0.076, from: 0.56 },
    { cx: 0.215, cy: 0.405, rx: 0.16, ry: 0.074, from: 0.7 },
    { cx: 0.715, cy: 0.285, rx: 0.11, ry: 0.056, from: 0.86 },
    { cx: 0.275, cy: 0.615, rx: 0.115, ry: 0.054, from: 0.34 },
  ];
  const padArea = pads.reduce((sum, p) => sum + p.rx * p.ry, 0);

  const nPot = Math.round(count * 0.12);
  const nTrunk = Math.round(count * 0.19);
  const nBranch = Math.round(count * 0.08);
  const nFoliage = count - nPot - nTrunk - nBranch;

  // Pot: a shallow tray, wider at the rim.
  for (let i = 0; i < nPot; i++) {
    const rim = i % 3 === 0;
    const v = rim ? rand() * 0.012 : 0.012 + rand() * 0.062;
    const half = rim ? 0.215 : 0.2 - 0.5 * v;
    points.push({ x: 0.5 + (rand() * 2 - 1) * half, y: 0.872 + v, a: rim ? 0.85 : 0.4 + rand() * 0.25, s: 1, sway: 0 });
  }
  // Trunk: thick at the base, tapering to the apex.
  for (let i = 0; i < nTrunk; i++) {
    const t = Math.pow(rand(), 1.35);
    const [x, y] = bezier(trunk, t);
    const width = 0.042 * (1 - t) * (1 - t) + 0.009;
    points.push({ x: x + gauss() * width, y: y + gauss() * 0.006, a: 0.7 + rand() * 0.25, s: 1.1, sway: t * 0.35 });
  }
  // Branches: from the trunk out to each pad.
  for (let i = 0; i < nBranch; i++) {
    const pad = pads[1 + (i % (pads.length - 1))];
    const [sx, sy] = bezier(trunk, pad.from);
    const t = rand();
    const lift = Math.sin(t * Math.PI) * 0.03;
    points.push({
      x: sx + (pad.cx - sx) * t + gauss() * 0.006,
      y: sy + (pad.cy + pad.ry * 0.5 - sy) * t + lift + gauss() * 0.005,
      a: 0.6 + rand() * 0.25,
      s: 1,
      sway: 0.4 + t * 0.4,
    });
  }
  // Foliage: flat-bottomed, domed pads, denser toward the top edge.
  for (let i = 0; i < nFoliage; i++) {
    let pick = rand() * padArea;
    let pad = pads[0];
    for (const p of pads) {
      pick -= p.rx * p.ry;
      if (pick <= 0) {
        pad = p;
        break;
      }
    }
    const angle = rand() * TAU;
    const radius = Math.sqrt(rand());
    let dy = Math.sin(angle) * radius;
    if (dy > 0) dy *= 0.32;
    points.push({
      x: pad.cx + Math.cos(angle) * radius * pad.rx,
      y: pad.cy + dy * pad.ry,
      a: 0.38 + rand() * 0.55,
      s: 0.9 + rand() * 0.5,
      sway: 1,
    });
  }
  return points;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ counts: number[], from: string, land: {step:number, cols:number, rows:number, bits:string},
 *   cities: {name:string, lat:number, lon:number}[], font: string, reduced: boolean }} options
 */
export function createDots(canvas, options) {
  const { counts, land, cities, reduced } = options;
  const ctx = canvas.getContext('2d');
  const N = counts.reduce((sum, c) => sum + c, 0);
  const rand = mulberry32(20260502);

  // ——— Per-dot state ———
  const x = new Float32Array(N);
  const y = new Float32Array(N);
  const s = new Float32Array(N);
  const a = new Float32Array(N);
  const tx = new Float32Array(N);
  const ty = new Float32Array(N);
  const ts = new Float32Array(N);
  const ta = new Float32Array(N);
  const rate = new Float32Array(N);
  const r1 = new Float32Array(N);
  const r2 = new Float32Array(N);
  const r3 = new Float32Array(N);
  const gauss = new Float32Array(N);
  const order = new Uint16Array(N); // a shuffled index, so formations don't inherit calendar order
  const day = new Uint16Array(N);
  const slot = new Uint16Array(N);

  for (let i = 0; i < N; i++) {
    r1[i] = rand();
    r2[i] = rand();
    r3[i] = rand();
    gauss[i] = (rand() + rand() + rand() + rand() - 2) / 1.16;
    rate[i] = 0.04 + rand() * 0.07;
    order[i] = i;
  }
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const swap = order[i];
    order[i] = order[j];
    order[j] = swap;
  }
  for (let d = 0, i = 0; d < counts.length; d++) {
    for (let k = 0; k < counts[d]; k++, i++) {
      day[i] = d;
      slot[i] = k;
    }
  }

  // ——— Globe: a Fibonacci sphere, each point flagged land or sea ———
  const mask = Uint8Array.from(atob(land.bits), (ch) => ch.charCodeAt(0));
  const isLand = (lat, lon) => {
    const row = Math.min(land.rows - 1, Math.max(0, Math.floor((90 - lat) / land.step)));
    const col = ((Math.floor((lon + 180) / land.step) % land.cols) + land.cols) % land.cols;
    const bit = row * land.cols + col;
    return (mask[bit >> 3] >> (bit & 7)) & 1;
  };
  const cityVectors = cities.map((c) => toVector(c.lat, c.lon));
  const viewLon = (cities[0].lon + cities[1].lon) / 2;
  const viewLat = 14;
  // Sample a Fibonacci sphere ever more finely until the land inside the
  // hemisphere we look at holds at least one point per dot.
  const sphere = new Float32Array(N * 3);
  {
    const centre = toVector(viewLat, viewLon);
    const edge = Math.cos(82 * RAD);
    let picked = [];
    for (let samples = 6000; samples < 400000; samples = Math.round(samples * 1.25)) {
      picked = [];
      for (let k = 0; k < samples; k++) {
        const lat = Math.asin(1 - (2 * (k + 0.5)) / samples) / RAD;
        const lon = (((k * GOLDEN) / RAD) % 360) - 180;
        if (!isLand(lat, lon)) continue;
        const v = toVector(lat, lon);
        if (v[0] * centre[0] + v[1] * centre[1] + v[2] * centre[2] >= edge) picked.push(v);
      }
      if (picked.length >= N) break;
    }
    for (let i = 0; i < N; i++) {
      const v = picked[Math.floor((order[i] * picked.length) / N) % picked.length];
      sphere[i * 3] = v[0];
      sphere[i * 3 + 1] = v[1];
      sphere[i * 3 + 2] = v[2];
    }
  }
  const arc = [];
  {
    const [p, q] = cityVectors;
    const omega = Math.acos(p[0] * q[0] + p[1] * q[1] + p[2] * q[2]);
    for (let k = 0; k <= 56; k++) {
      const f = k / 56;
      const wa = Math.sin((1 - f) * omega) / Math.sin(omega);
      const wb = Math.sin(f * omega) / Math.sin(omega);
      const lift = 1 + 0.13 * Math.sin(f * Math.PI);
      arc.push([(wa * p[0] + wb * q[0]) * lift, (wa * p[1] + wb * q[1]) * lift, (wa * p[2] + wb * q[2]) * lift]);
    }
  }

  // ——— Bonsai ———
  const bonsai = growBonsai(N, mulberry32(8088));

  // ——— Calendar ———
  const startDate = new Date(`${options.from}T00:00:00Z`);
  const weekdayOffset = (startDate.getUTCDay() + 6) % 7; // Monday = 0
  const weeks = Math.ceil((weekdayOffset + counts.length) / 7);
  const monthMarks = [];
  for (let d = 0; d < counts.length; d++) {
    const date = new Date(startDate.getTime() + d * 86400000);
    if (date.getUTCDate() === 1 || d === 0) {
      monthMarks.push({
        week: Math.floor((weekdayOffset + d) / 7),
        label: date.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }),
      });
    }
  }

  // ——— Runtime ———
  let W = 0;
  let H = 0;
  let dpr = 1;
  let formation = 'field';
  let since = 0;
  let getStage = () => null;
  let getPocket = () => null;
  let frame = 0;
  let running = false;
  let clock = 0;
  let last = 0;
  let born = false;
  const pointer = { x: 0, y: 0, on: false };
  const ripples = [];
  const decor = { trend: 0, globe: 0, calendar: 0, point: 0 };

  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  {
    const g = sprite.getContext('2d');
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(16, 16, 15, 0, TAU);
    g.fill();
  }
  const halo = document.createElement('canvas');
  halo.width = halo.height = 64;
  {
    const g = halo.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,0.55)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!born) {
      for (let i = 0; i < N; i++) {
        x[i] = r1[i] * W;
        y[i] = r2[i] * H;
        s[i] = 1;
        a[i] = 0;
      }
      born = true;
    }
    if (!running) draw(true);
  }

  const stageRect = () => getStage() || { x: 0, y: 0, width: W, height: H };

  /** The globe's projection for this instant, shared by the dots and the decor. */
  function globeView(rect, t) {
    const yaw = (viewLon + Math.sin(t * 0.21) * 24) * RAD;
    const pitch = viewLat * RAD;
    const R = Math.min(rect.width, rect.height) * 0.46;
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    return (vx, vy, vz) => {
      const X = vx * cosY - vz * sinY;
      const Z0 = vx * sinY + vz * cosY;
      const Y = vy * cosP - Z0 * sinP;
      const Z = vy * sinP + Z0 * cosP;
      return [cx + R * X, cy - R * Y, Z];
    };
  }

  function calendarLayout(rect) {
    // Split the weeks into bands when the stage is narrow, so a day never gets too small.
    let best = { bands: 1, cell: 0 };
    for (let bands = 1; bands <= 3; bands++) {
      const perBand = Math.ceil(weeks / bands);
      const cell = Math.min(rect.width / perBand, rect.height / (bands * 7 + (bands - 1) * 1.6 + 1.2));
      if (cell > best.cell) best = { bands, cell };
    }
    const perBand = Math.ceil(weeks / best.bands);
    const width = perBand * best.cell;
    const height = (best.bands * 7 + (best.bands - 1) * 1.6) * best.cell;
    return {
      cell: best.cell,
      perBand,
      left: rect.x + (rect.width - width) / 2,
      top: rect.y + (rect.height - height) / 2 + best.cell * 0.6,
    };
  }

  function setTargets(t) {
    const rect = stageRect();
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const elapsed = t - since;

    if (formation === 'field') {
      const cols = Math.ceil(Math.sqrt((N * W) / H));
      const rows = Math.ceil(N / cols);
      const cw = W / cols;
      const ch = H / rows;
      const pocket = getPocket();
      for (let i = 0; i < N; i++) {
        const k = order[i];
        const px = ((k % cols) + 0.5 + (r1[i] - 0.5) * 0.95) * cw + Math.sin(t * (0.25 + r3[i] * 0.5) + r1[i] * TAU) * 7;
        const py = (Math.floor(k / cols) + 0.5 + (r2[i] - 0.5) * 0.95) * ch + Math.cos(t * (0.2 + r1[i] * 0.5) + r2[i] * TAU) * 7;
        const ridge = smooth(0.42, 0.8, noise(px * 0.0042 + t * 0.04, py * 0.0042 - t * 0.014));
        // Each dot also flickers on its own clock: this is the noise.
        const flicker = Math.pow(Math.max(0, Math.sin(t * (0.7 + r3[i] * 1.8) + r1[i] * TAU)), 6);
        let alpha = 0.2 + 0.58 * ridge + 0.3 * flicker;
        if (pocket) {
          // Keep a pocket of calm behind the words.
          const dx = Math.max(pocket.x - px, 0, px - (pocket.x + pocket.width));
          const dy = Math.max(pocket.y - py, 0, py - (pocket.y + pocket.height));
          alpha *= 0.15 + 0.85 * smooth(0, 70, Math.hypot(dx, dy));
        }
        tx[i] = px;
        ty[i] = py;
        ta[i] = alpha;
        ts[i] = 1 + 1.25 * ridge + 0.35 * flicker;
      }
    } else if (formation === 'trend') {
      // A scatter that tightens around its line: the noise giving up its signal.
      const settle = Math.exp(-elapsed / 1.5);
      for (let i = 0; i < N; i++) {
        const outlier = r2[i] < 0.14;
        const u = r1[i];
        const spread = rect.height * ((outlier ? 0.2 : 0.058) + 0.3 * settle);
        const fit = Math.exp(-gauss[i] * gauss[i]);
        tx[i] = rect.x + rect.width * (0.07 + 0.88 * u);
        ty[i] = rect.y + rect.height * (0.86 - 0.7 * u) + gauss[i] * spread;
        ta[i] = outlier ? 0.26 : 0.3 + 0.55 * fit * (1 - settle * 0.6);
        ts[i] = outlier ? 0.85 : 0.95 + 0.6 * fit;
      }
    } else if (formation === 'globe') {
      const project = globeView(rect, t);
      for (let i = 0; i < N; i++) {
        const p = project(sphere[i * 3], sphere[i * 3 + 1], sphere[i * 3 + 2]);
        const front = Math.max(p[2], 0);
        tx[i] = p[0];
        ty[i] = p[1];
        ta[i] = p[2] > 0.03 ? 0.24 + 0.66 * front : 0;
        ts[i] = 0.85 + 0.4 * front;
      }
    } else if (formation === 'calendar') {
      const layout = calendarLayout(rect);
      const reach = layout.cell * 0.46;
      for (let i = 0; i < N; i++) {
        const index = weekdayOffset + day[i];
        const week = Math.floor(index / 7);
        const band = Math.floor(week / layout.perBand);
        const col = week % layout.perBand;
        const row = index % 7;
        const count = counts[day[i]];
        const radius = reach * Math.sqrt((slot[i] + 0.5) / count) * Math.min(1, Math.sqrt(count / 30));
        const angle = slot[i] * GOLDEN;
        tx[i] = layout.left + (col + 0.5) * layout.cell + Math.cos(angle) * radius;
        ty[i] = layout.top + (band * 8.6 + row + 0.5) * layout.cell + Math.sin(angle) * radius;
        ta[i] = 0.5 + 0.4 * r3[i];
        ts[i] = Math.max(0.75, Math.min(1.15, layout.cell / 19));
      }
    } else if (formation === 'grid') {
      const spacing = Math.sqrt((W * H) / N);
      const cols = Math.max(1, Math.round(W / spacing));
      const rows = Math.ceil(N / cols);
      const gx = W / cols;
      const gy = H / rows;
      for (let i = 0; i < N; i++) {
        const px = ((i % cols) + 0.5) * gx;
        const py = (Math.floor(i / cols) + 0.5) * gy;
        const wave = smooth(0.5, 0.92, noise(px * 0.0036 + t * 0.05, py * 0.0036 + t * 0.028));
        tx[i] = px;
        ty[i] = py;
        ta[i] = 0.085 + 0.2 * wave;
        ts[i] = 0.8 + 0.25 * wave;
      }
    } else if (formation === 'bonsai') {
      const scale = Math.min(rect.width, rect.height) * 1.04;
      for (let i = 0; i < N; i++) {
        const p = bonsai[order[i]];
        const breeze = Math.sin(t * 0.7 + p.y * 9 + r1[i] * 2) * 1.6 * p.sway;
        tx[i] = cx + (p.x - 0.5) * scale + breeze;
        ty[i] = cy + (p.y - 0.53) * scale;
        ta[i] = p.a;
        ts[i] = p.s;
      }
    } else if (formation === 'point') {
      // Everything comes home to one dot, which beats.
      const beat = Math.pow(Math.max(0, Math.sin((t % 1.9) * (Math.PI / 1.9))), 8);
      for (let i = 0; i < N; i++) {
        const radius = r1[i] * r1[i] * (3.2 + 2.4 * beat);
        const angle = r2[i] * TAU + t * 0.4;
        tx[i] = cx + Math.cos(angle) * radius;
        ty[i] = cy + Math.sin(angle) * radius;
        ta[i] = 0.9;
        ts[i] = 1.05;
      }
    }
  }

  function drawDecor(t) {
    const rect = stageRect();
    ctx.lineWidth = 1;

    if (decor.trend > 0.01) {
      const w = decor.trend;
      const x0 = rect.x + rect.width * 0.04;
      const y0 = rect.y + rect.height * 0.94;
      ctx.strokeStyle = `rgba(255,255,255,${0.2 * w})`;
      ctx.beginPath();
      ctx.moveTo(x0, rect.y + rect.height * 0.06);
      ctx.lineTo(x0, y0);
      ctx.lineTo(rect.x + rect.width * 0.98, y0);
      ctx.stroke();
      for (let k = 1; k <= 5; k++) {
        const gx = x0 + ((rect.width * 0.94) / 5) * k;
        ctx.beginPath();
        ctx.moveTo(gx, y0);
        ctx.lineTo(gx, y0 + 5);
        ctx.stroke();
      }
      // The fitted line draws itself once the scatter has settled.
      const drawn = smooth(1.2, 3.2, t - since) * w;
      if (formation === 'trend' && drawn > 0) {
        const ax = rect.x + rect.width * 0.07;
        const ay = rect.y + rect.height * 0.86;
        ctx.strokeStyle = `rgba(255,255,255,${0.55 * w})`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + rect.width * 0.88 * drawn, ay - rect.height * 0.7 * drawn);
        ctx.stroke();
      }
    }

    if (decor.globe > 0.01 && formation === 'globe') {
      const w = decor.globe;
      const project = globeView(rect, t);
      // The limb: a hairline that makes the continents sit on a sphere.
      ctx.strokeStyle = `rgba(255,255,255,${0.16 * w})`;
      ctx.beginPath();
      ctx.arc(rect.x + rect.width / 2, rect.y + rect.height / 2, Math.min(rect.width, rect.height) * 0.46, 0, TAU);
      ctx.stroke();
      // The route between the two cities, with a pulse travelling along it.
      const head = ((t - since) * 0.22) % 1.25;
      for (let k = 0; k < arc.length; k++) {
        const p = project(arc[k][0], arc[k][1], arc[k][2]);
        if (p[2] < -0.05) continue;
        const f = k / (arc.length - 1);
        const glow = Math.exp(-Math.pow((f - head) / 0.07, 2));
        ctx.globalAlpha = w * (0.5 + 0.5 * glow);
        ctx.drawImage(sprite, p[0] - 1.1 - glow, p[1] - 1.1 - glow, 2.2 + 2 * glow, 2.2 + 2 * glow);
      }
      ctx.font = options.font;
      ctx.textBaseline = 'middle';
      cityVectors.forEach((v, index) => {
        const p = project(v[0], v[1], v[2]);
        if (p[2] < 0) return;
        const ring = 7 + 9 * (((t + index * 0.9) % 2.4) / 2.4);
        ctx.globalAlpha = w;
        ctx.drawImage(halo, p[0] - 16, p[1] - 16, 32, 32);
        ctx.drawImage(sprite, p[0] - 3.2, p[1] - 3.2, 6.4, 6.4);
        ctx.strokeStyle = `rgba(255,255,255,${0.7 * w * (1 - (ring - 7) / 9)})`;
        ctx.beginPath();
        ctx.arc(p[0], p[1], ring, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${0.86 * w})`;
        ctx.textAlign = index === 0 ? 'left' : 'right';
        ctx.fillText(cities[index].name, p[0] + (index === 0 ? 16 : -16), p[1] + (index === 0 ? 12 : -12));
      });
      ctx.globalAlpha = 1;
    }

    if (decor.calendar > 0.01) {
      const w = decor.calendar;
      const layout = calendarLayout(rect);
      ctx.font = options.font;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = `rgba(255,255,255,${0.5 * w})`;
      for (const mark of monthMarks) {
        const band = Math.floor(mark.week / layout.perBand);
        const col = mark.week % layout.perBand;
        ctx.fillText(mark.label, layout.left + col * layout.cell + 1, layout.top + band * 8.6 * layout.cell - layout.cell * 0.45);
      }
    }

    if (decor.point > 0.01) {
      const w = decor.point;
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      ctx.globalAlpha = w * 0.9;
      ctx.drawImage(halo, cx - 30, cy - 30, 60, 60);
      ctx.globalAlpha = 1;
      for (let k = 0; k < 3; k++) {
        const phase = ((t + k * 0.6333) % 1.9) / 1.9;
        ctx.strokeStyle = `rgba(255,255,255,${0.42 * w * (1 - phase) * (1 - phase)})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 8 + phase * Math.min(rect.width, rect.height) * 0.42, 0, TAU);
        ctx.stroke();
      }
    }
  }

  function draw(snap) {
    const t = clock;
    setTargets(t);
    ctx.clearRect(0, 0, W, H);

    for (const key in decor) {
      const goal = key === formation ? 1 : 0;
      decor[key] = snap ? goal : decor[key] + (goal - decor[key]) * 0.07;
    }
    for (let k = ripples.length - 1; k >= 0; k--) if (t - ripples[k].t > 1.7) ripples.splice(k, 1);

    const reach = 130;
    for (let i = 0; i < N; i++) {
      const k = snap ? 1 : rate[i];
      x[i] += (tx[i] - x[i]) * k;
      y[i] += (ty[i] - y[i]) * k;
      s[i] += (ts[i] - s[i]) * (snap ? 1 : 0.12);
      a[i] += (ta[i] - a[i]) * (snap ? 1 : 0.1);

      let px = x[i];
      let py = y[i];
      let alpha = a[i];

      if (pointer.on) {
        const dx = px - pointer.x;
        const dy = py - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < reach * reach) {
          const d = Math.sqrt(d2) || 1;
          const f = 1 - d / reach;
          px += (dx / d) * f * f * 20;
          py += (dy / d) * f * f * 20;
          alpha += f * 0.4;
        }
      }
      for (let r = 0; r < ripples.length; r++) {
        const ripple = ripples[r];
        const age = t - ripple.t;
        const dx = px - ripple.x;
        const dy = py - ripple.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const band = Math.exp(-Math.pow((d - age * 560) / 38, 2)) * (1 - age / 1.7);
        if (band > 0.01) {
          alpha += 0.75 * band;
          px += (dx / d) * 7 * band;
          py += (dy / d) * 7 * band;
        }
      }

      if (alpha < 0.012) continue;
      if (alpha > 1) alpha = 1;
      const radius = s[i];
      if (alpha > 0.82 && radius > 1.3) {
        ctx.globalAlpha = (alpha - 0.82) * 1.6;
        ctx.drawImage(halo, px - radius * 5, py - radius * 5, radius * 10, radius * 10);
      }
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, px - radius, py - radius, radius * 2, radius * 2);
    }
    ctx.globalAlpha = 1;
    drawDecor(t);
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    clock += dt;
    draw(false);
    frame = requestAnimationFrame(loop);
  }

  const api = {
    count: N,
    /** Move the dots into a formation. `stage` returns the box it should fill, in viewport pixels. */
    setFormation(name, stage, pocket) {
      getStage = stage || (() => null);
      getPocket = pocket || (() => null);
      if (name !== formation) {
        formation = name;
        since = clock;
      }
      if (reduced) draw(true);
    },
    ripple(px, py) {
      if (reduced) return;
      ripples.push({ x: px, y: py, t: clock });
      if (ripples.length > 4) ripples.shift();
    },
    pointer(px, py, on) {
      pointer.x = px;
      pointer.y = py;
      pointer.on = on && !reduced;
    },
    /** Reduced motion: redraw in place, for instance after a scroll. */
    refresh() {
      if (reduced) draw(true);
    },
    start() {
      if (reduced || running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
    resize,
  };

  // Under reduced motion the clock is parked on a frame where every formation reads well.
  if (reduced) clock = 6;
  resize();
  return api;
}
