#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

const platform = os.platform();
const isWindows = platform === 'win32';

// Print header
console.clear();
console.log(colors.cyan + '========================================');
console.log('   🃏  FRIENDLY POKER TABLE');
console.log('========================================' + colors.reset);
console.log();

// Function to spawn process based on platform
function startProcess(name, command, args, cwd) {
  const shell = isWindows ? true : false;
  const proc = spawn(command, args, {
    cwd: cwd,
    shell: shell,
    stdio: 'inherit',
    detached: !isWindows
  });

  proc.on('error', (err) => {
    console.error(colors.yellow + `Failed to start ${name}:`, err.message + colors.reset);
  });

  return proc;
}

// Start backend
console.log(colors.green + '🚀 Starting Backend Server...' + colors.reset);
const backendPath = path.join(__dirname, 'backend');
const backendProc = startProcess(
  'Backend',
  isWindows ? 'npm.cmd' : 'npm',
  ['run', 'dev'],
  backendPath
);

// Wait a bit for backend to start
setTimeout(() => {
  console.log(colors.green + '🚀 Starting Frontend Server...' + colors.reset);
  const frontendPath = path.join(__dirname, 'frontend');
  const frontendProc = startProcess(
    'Frontend',
    isWindows ? 'npm.cmd' : 'npm',
    ['run', 'dev'],
    frontendPath
  );

  // Display success message after frontend starts
  setTimeout(() => {
    console.log();
    console.log(colors.cyan + '========================================');
    console.log('   ✅ SERVERS ARE RUNNING!');
    console.log('========================================' + colors.reset);
    console.log();
    console.log(colors.bright + '  Backend:  ' + colors.green + 'http://localhost:3001' + colors.reset);
    console.log(colors.bright + '  Frontend: ' + colors.green + 'http://localhost:3000' + colors.reset);
    console.log();
    console.log(colors.cyan + '========================================' + colors.reset);
    console.log();
    console.log(colors.yellow + '  >> COPY THIS LINK TO YOUR BROWSER:' + colors.reset);
    console.log();
    console.log(colors.bright + colors.magenta + '     http://localhost:3000' + colors.reset);
    console.log();
    console.log(colors.cyan + '========================================' + colors.reset);
    console.log();
    console.log(colors.yellow + '  Press Ctrl+C to stop all servers' + colors.reset);
    console.log();

    // Try to open browser
    setTimeout(() => {
      const open = require('child_process').spawn;
      let command;

      if (isWindows) {
        command = open('cmd', ['/c', 'start', 'http://localhost:3000']);
      } else if (platform === 'darwin') {
        command = open('open', ['http://localhost:3000']);
      } else {
        command = open('xdg-open', ['http://localhost:3000']);
      }

      command.on('error', () => {
        // Silently fail if browser can't be opened
      });
    }, 2000);
  }, 3000);

  // Handle cleanup on exit
  const cleanup = () => {
    console.log();
    console.log(colors.yellow + '🛑 Shutting down servers...' + colors.reset);

    if (backendProc) {
      backendProc.kill();
    }
    if (frontendProc) {
      frontendProc.kill();
    }

    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

}, 3000);
