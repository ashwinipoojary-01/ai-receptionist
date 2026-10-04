import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeExe = process.execPath;
const serverRoot = path.resolve(__dirname, 'server');
const clientRoot = path.resolve(__dirname, 'client');
const tsxCli = path.resolve(__dirname, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const viteCli = path.resolve(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');

console.log('🚀 Launching AI Receptionist Server (Port 5000) and Client (Port 5173)...\n');

// 1. Launch Backend Server
const serverProcess = spawn(nodeExe, [tsxCli, 'watch', 'src/index.ts'], {
  cwd: serverRoot,
  stdio: 'inherit',
});

// 2. Launch Vite Client
const clientProcess = spawn(nodeExe, [viteCli, '--port', '5173', '--host'], {
  cwd: clientRoot,
  stdio: 'inherit',
});

const cleanup = () => {
  console.log('\n🛑 Shutting down AI Receptionist processes...');
  try {
    serverProcess.kill();
    clientProcess.kill();
  } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
