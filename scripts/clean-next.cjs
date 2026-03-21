/**
 * Remove .next so the next `next dev` / `next build` creates a full output
 * (fixes missing middleware-manifest.json, vendor chunks, etc.).
 *
 * On Windows, EPERM usually means another process still has files open:
 *   - Stop `next dev` (Ctrl+C) and wait a few seconds
 *   - Close other terminals running Node in this project
 *   - End stray node.exe in Task Manager if needed
 *   - Pause OneDrive/antivirus for this folder if it keeps happening
 */
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const nextDir = path.join(process.cwd(), '.next');

function tryNodeRm() {
  if (!fs.existsSync(nextDir)) return true;
  fs.rmSync(nextDir, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 200,
  });
  return !fs.existsSync(nextDir);
}

function tryWindowsRmdir() {
  if (process.platform !== 'win32' || !fs.existsSync(nextDir)) return false;
  const r = spawnSync('cmd.exe', ['/c', 'rmdir', '/s', '/q', nextDir], {
    encoding: 'utf8',
    windowsHide: true,
  });
  return r.status === 0 && !fs.existsSync(nextDir);
}

function tryPowerShellRemove() {
  if (process.platform !== 'win32' || !fs.existsSync(nextDir)) return false;
  const escaped = nextDir.replace(/'/g, "''");
  try {
    execFileSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        `Remove-Item -LiteralPath '${escaped}' -Recurse -Force -ErrorAction Stop`,
      ],
      { stdio: 'inherit', windowsHide: true }
    );
  } catch {
    return false;
  }
  return !fs.existsSync(nextDir);
}

if (!fs.existsSync(nextDir)) {
  console.log('No .next folder to remove');
  process.exit(0);
}

let ok = false;
try {
  ok = tryNodeRm();
} catch (err) {
  const code = err && err.code;
  if (code === 'EPERM' || code === 'EBUSY') {
    console.warn('Node could not remove .next (files may be locked). Trying Windows fallbacks…');
  } else {
    throw err;
  }
}

if (!ok && fs.existsSync(nextDir)) {
  ok = tryWindowsRmdir();
}
if (!ok && fs.existsSync(nextDir)) {
  ok = tryPowerShellRemove();
}

if (!ok && fs.existsSync(nextDir)) {
  console.error(`
Could not delete .next (permission denied / files in use).

Do this:
  1. Stop every "next dev" for this project (Ctrl+C in all terminals).
  2. Task Manager → end stray "node.exe" processes.
  3. Wait a few seconds, then:  npm run clean

Or delete this folder in File Explorer:
  ${nextDir}
`);
  process.exit(1);
}

console.log('Removed .next');
