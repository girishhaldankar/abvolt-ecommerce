// server.js - QUBI Arduino Upload Server

const express = require('express');
const cors    = require('cors');
const { SerialPort } = require('serialport');
const { exec }       = require('child_process');
const fs   = require('fs-extra');
const path = require('path');
// NOTE: multer is not used — remove from npm install if desired
// const multer = require('multer');  // unused

const app  = express();
const PORT = 3000;

// ── Middleware ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
// express.text() is not needed — all endpoints use JSON

// ── Temp directory ──────────────────────────────────────────────────
const TEMP_DIR = path.join(__dirname, 'temp_sketches');
fs.ensureDirSync(TEMP_DIR);

// ── Persistent build cache ──────────────────────────────────────────
// Without this, every compile recompiles the entire ESP32 core, WiFi
// stack, and all included libraries from scratch — that's the bulk of
// the "long compile" time. With --build-cache-path, arduino-cli caches
// the compiled core/library object files here and only rebuilds the
// user's sketch.ino on subsequent compiles, which is dramatically faster
// (often 60-90s -> 5-15s after the first compile).
const BUILD_CACHE_DIR = path.join(__dirname, 'build_cache');
fs.ensureDirSync(BUILD_CACHE_DIR);

// ── Exec options: prevent hangs and buffer overflows ────────────────
const EXEC_OPTS = {
  timeout:   120000,       // 2 minutes max per compile/upload
  maxBuffer: 10 * 1024 * 1024  // 10 MB stdout/stderr buffer
};

// ── Input sanitizer: only allow safe port/board strings ─────────────
// Prevents shell injection if a malicious client sends e.g. port="; rm -rf /"
function safePath(value, allowSlash = true) {
  // Allow alphanumeric, dots, hyphens, underscores, colons, and optionally slashes
  const pattern = allowSlash ? /[^a-zA-Z0-9._:\-\/\\]/ : /[^a-zA-Z0-9._:\-]/;
  if (pattern.test(value)) throw new Error(`Invalid value: "${value}"`);
  return value;
}

// ── Helper: write sketch to temp dir ────────────────────────────────
async function writeSketch(code, prefix = 'sketch') {
  const id  = `${prefix}_${Date.now()}`;
  const dir  = path.join(TEMP_DIR, id);
  const file = path.join(dir, `${id}.ino`);
  await fs.ensureDir(dir);
  await fs.writeFile(file, code, 'utf8');
  return { id, dir, file };
}

// ── Helper: clean up sketch dir silently ────────────────────────────
async function cleanup(dir) {
  await fs.remove(dir).catch(() => {});
}

// ── Helper: send one response safely (prevents double-response) ─────
function respond(res, status, body) {
  if (!res.headersSent) res.status(status).json(body);
}

// ══════════════════════════════════════════════════════════════════
// GET /api/health
// ══════════════════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'QUBI Upload Server is running', version: '1.1.0' });
});

// ══════════════════════════════════════════════════════════════════
// GET /api/ports  — list serial ports, return ALL with an isArduino flag
// FIX: was filtering to arduinoPorts but returning unfiltered `ports`
// ══════════════════════════════════════════════════════════════════
app.get('/api/ports', async (req, res) => {
  try {
    const raw = await SerialPort.list();
    const ports = raw.map(p => {
      const mfr  = (p.manufacturer || '').toLowerCase();
      const pth  = (p.path || '').toLowerCase();
      const isArduino =
        mfr.includes('arduino') || mfr.includes('ch340') || mfr.includes('cp210') ||
        mfr.includes('ftdi')    || mfr.includes('silicon') ||
        pth.includes('ttyusb')  || pth.includes('ttyacm')  ||
        pth.includes('cu.usbserial') || pth.includes('cu.usbmodem');
      return { ...p, isArduino };
    });
    // Sort: Arduino-like ports first
    ports.sort((a, b) => (b.isArduino ? 1 : 0) - (a.isArduino ? 1 : 0));
    res.json({ success: true, ports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════
// POST /api/compile  — compile only, no upload
// FIX: was reading req.body as raw string; no cleanup; wrong output field;
//      hardcoded board; no shell sanitization; no exec timeout
// ══════════════════════════════════════════════════════════════════
app.post('/api/compile', async (req, res) => {
  const { code, board = 'esp32:esp32:esp32' } = req.body;

  if (!code) return respond(res, 400, { success: false, error: 'No code provided' });

  let dir;
  try {
    const safeBoard = safePath(board, false);
    const sketch = await writeSketch(code, 'compile');
    dir = sketch.dir;

    const cmd = `arduino-cli compile --fqbn ${safeBoard} --build-cache-path "${BUILD_CACHE_DIR}" "${sketch.dir}"`;
    exec(cmd, EXEC_OPTS, async (err, stdout, stderr) => {
      await cleanup(dir);

      if (err) {
        // arduino-cli puts error detail in stderr
        const detail = (stderr || stdout || err.message || '').trim();
        return respond(res, 400, { success: false, error: 'Compilation failed', details: detail, stderr, stdout });
      }

      // arduino-cli puts "Sketch uses X bytes" in stderr on success
      respond(res, 200, { success: true, message: 'Compilation successful', output: stderr || stdout, stderr, stdout });
    });

  } catch (err) {
    await cleanup(dir);
    respond(res, 500, { success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════
// POST /api/upload  — compile then upload (two-step)
// FIX: no shell sanitization; no exec timeout; stderr not included in success
// ══════════════════════════════════════════════════════════════════
app.post('/api/upload', async (req, res) => {
  const { code, port, board = 'esp32:esp32:esp32' } = req.body;

  if (!code || !port) return respond(res, 400, { success: false, error: 'Code and port are required' });

  let dir;
  try {
    const safeBoard = safePath(board, false);
    const safePort  = safePath(port);
    const sketch = await writeSketch(code, 'upload');
    dir = sketch.dir;

    const cmd = `arduino-cli compile --fqbn ${safeBoard} --build-cache-path "${BUILD_CACHE_DIR}" "${sketch.dir}" && arduino-cli upload -p ${safePort} --fqbn ${safeBoard} "${sketch.dir}"`;
    exec(cmd, EXEC_OPTS, async (err, stdout, stderr) => {
      await cleanup(dir);
      if (err) return respond(res, 400, { success: false, error: 'Upload failed', details: stderr || err.message, stderr, stdout });
      respond(res, 200, { success: true, message: 'Upload successful!', output: stderr || stdout, stderr, stdout });
    });

  } catch (err) {
    await cleanup(dir);
    respond(res, 500, { success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════
// POST /api/quick-upload  — compile + upload in one arduino-cli call
// FIX: default board was 'arduino:avr:uno' (wrong for ESP32!); no sanitization; no timeout
// ══════════════════════════════════════════════════════════════════
app.post('/api/quick-upload', async (req, res) => {
  const { code, port, board = 'esp32:esp32:esp32' } = req.body;  // FIX: correct default

  if (!code || !port) return respond(res, 400, { success: false, error: 'Code and port are required' });

  let dir;
  try {
    const safeBoard = safePath(board, false);
    const safePort  = safePath(port);
    const sketch = await writeSketch(code, 'quick');
    dir = sketch.dir;

    const cmd = `arduino-cli compile --fqbn ${safeBoard} --build-cache-path "${BUILD_CACHE_DIR}" --upload -p ${safePort} "${sketch.dir}"`;
    exec(cmd, EXEC_OPTS, async (err, stdout, stderr) => {
      await cleanup(dir);
      if (err) return respond(res, 400, { success: false, error: 'Upload failed', details: stderr || err.message, stderr, stdout });
      respond(res, 200, { success: true, message: 'Code uploaded successfully!', output: stderr || stdout, stderr, stdout });
    });

  } catch (err) {
    await cleanup(dir);
    respond(res, 500, { success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════
// SERIAL MONITOR endpoints
// FIX: close() is callback-based — call it safely; check isOpen before close
// ══════════════════════════════════════════════════════════════════
let serialConnection = null;

function closeSerial() {
  return new Promise(resolve => {
    if (!serialConnection) return resolve();
    if (!serialConnection.isOpen) { serialConnection = null; return resolve(); }
    serialConnection.close(err => {
      if (err) console.error('Error closing serial port:', err.message);
      serialConnection = null;
      resolve();
    });
  });
}

app.post('/api/serial/open', async (req, res) => {
  const { port, baudRate = 9600 } = req.body;
  if (!port) return respond(res, 400, { success: false, error: 'Port is required' });

  try {
    await closeSerial();  // FIX: wait for previous port to fully close before opening new one
    serialConnection = new SerialPort({ path: port, baudRate: Number(baudRate) });
    serialConnection.on('error', err => console.error('Serial error:', err.message));
    respond(res, 200, { success: true, message: 'Serial port opened' });
  } catch (err) {
    respond(res, 500, { success: false, error: err.message });
  }
});

app.post('/api/serial/write', (req, res) => {
  const { data } = req.body;
  if (!serialConnection || !serialConnection.isOpen)
    return respond(res, 400, { success: false, error: 'Serial port not open' });
  if (data === undefined || data === null)
    return respond(res, 400, { success: false, error: 'No data provided' });

  try {
    serialConnection.write(String(data), err => {
      if (err) return respond(res, 500, { success: false, error: err.message });
      respond(res, 200, { success: true, message: 'Data sent' });
    });
  } catch (err) {
    respond(res, 500, { success: false, error: err.message });
  }
});

app.post('/api/serial/close', async (req, res) => {
  await closeSerial();
  respond(res, 200, { success: true, message: 'Serial port closed' });
});

// ══════════════════════════════════════════════════════════════════
// Start server
// ══════════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   QUBI Upload Server Running!            ║
  ║   Port : ${PORT}                            ║
  ║   URL  : http://localhost:${PORT}           ║
  ╚══════════════════════════════════════════╝

  Endpoints:
    GET  /api/health
    GET  /api/ports
    POST /api/compile
    POST /api/upload
    POST /api/quick-upload
    POST /api/serial/open
    POST /api/serial/write
    POST /api/serial/close

  Build cache: ${BUILD_CACHE_DIR}
    (first compile after a fresh cache will be slow — the ESP32 core
     gets built once and reused on every compile after that)

  Requires: arduino-cli  →  https://arduino.github.io/arduino-cli/
  `);
});

// Clean up on exit
process.on('SIGINT', async () => {
  console.log('\nShutting down — cleaning up temp files...');
  await closeSerial();
  await fs.remove(TEMP_DIR).catch(() => {});
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeSerial();
  await fs.remove(TEMP_DIR).catch(() => {});
  process.exit(0);
});