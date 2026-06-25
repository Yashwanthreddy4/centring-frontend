#!/bin/bash
# ============================================================
# CENTRING TRACKER — One-shot project setup
# Run this from your Downloads folder:
#   cd ~/Downloads
#   bash create-project.sh
# ============================================================

set -e

echo ""
echo "🏗️  Setting up Centring Tracker..."
echo ""

# ── 1. Create React app ──────────────────────────────────────
cd ~/Downloads

if [ -d "centring-frontend" ]; then
  echo "⚠️  centring-frontend folder already exists. Deleting and recreating..."
  rm -rf centring-frontend
fi

echo "📦 Creating React app (this takes 2-3 minutes)..."
npx create-react-app centring-frontend
cd centring-frontend

# ── 2. Install dependencies ──────────────────────────────────
echo ""
echo "📦 Installing axios, socket.io-client, tailwindcss..."
npm install axios socket.io-client
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# ── 3. Create folder structure ───────────────────────────────
mkdir -p src/context public

# ── 4. Patch tailwind.config.js ─────────────────────────────
cat > tailwind.config.js << 'TAILWIND'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
TAILWIND

# ── 5. Patch src/index.css ───────────────────────────────────
cat > src/index.css << 'CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
CSS

# ── 6. Create index.html ─────────────────────────────────────
cat > public/index.html << 'HTML'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <meta name="theme-color" content="#4f46e5" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <title>Centring Tracker</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
HTML

# ── 7. Create src/index.js ───────────────────────────────────
cat > src/index.js << 'INDEX'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
INDEX

# ── 8. Create .env ───────────────────────────────────────────
cat > .env << 'ENV'
REACT_APP_API_URL=http://localhost:4000
ENV

# ── 9. Copy your files from ~/Downloads/files/ ───────────────
FILES_DIR=~/Downloads/files

echo ""
echo "📋 Copying your existing files..."

if [ -f "$FILES_DIR/api.js" ]; then
  cp "$FILES_DIR/api.js" src/api.js
  echo "  ✅ api.js"
else
  echo "  ⚠️  api.js not found in ~/Downloads/files/ — copy it manually to src/api.js"
fi

if [ -f "$FILES_DIR/AuthContext.js" ]; then
  cp "$FILES_DIR/AuthContext.js" src/context/AuthContext.js
  # Fix import path in AuthContext
  sed -i '' "s|from '../api'|from '../api'|g" src/context/AuthContext.js
  echo "  ✅ AuthContext.js"
else
  echo "  ⚠️  AuthContext.js not found — copy it manually to src/context/AuthContext.js"
fi

if [ -f "$FILES_DIR/LangContext.js" ]; then
  cp "$FILES_DIR/LangContext.js" src/context/LangContext.js
  echo "  ✅ LangContext.js"
else
  echo "  ⚠️  LangContext.js not found — copy it manually to src/context/LangContext.js"
fi

if [ -f "$FILES_DIR/App.jsx" ]; then
  cp "$FILES_DIR/App.jsx" src/App.jsx
  rm -f src/App.js src/App.test.js src/logo.svg src/reportWebVitals.js src/setupTests.js
  echo "  ✅ App.jsx"
else
  echo "  ⚠️  App.jsx not found in ~/Downloads/files/ — copy it manually to src/App.jsx"
fi

# ── 10. Fix AuthContext import (it imports from '../api' which needs to be './api' relative to context/) 
# The path '../api' from src/context/ correctly points to src/api.js — no change needed

# ── 11. Start the app ────────────────────────────────────────
echo ""
echo "============================================"
echo "✅ Frontend project ready!"
echo "============================================"
echo ""
echo "📂 Project is at: ~/Downloads/centring-frontend"
echo ""
echo "▶️  To start the frontend:"
echo "    cd ~/Downloads/centring-frontend"
echo "    npm start"
echo ""
echo "🖥️  To run the backend (in a separate terminal):"
echo "    cd ~/Downloads/files"
echo "    npm install express pg socket.io cors bcryptjs jsonwebtoken dotenv"
echo "    node server.js"
echo ""
echo "⚠️  Backend needs a .env file with DATABASE_URL and JWT_SECRET"
echo "    See SETUP.md for full instructions."
echo ""
