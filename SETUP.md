# Centring Tracker — Setup Guide

## What you get
- Mobile-first React frontend (English + Telugu)
- Real-time sync via Socket.io (all 4 members see changes instantly)
- Role-based access: Owner sees everything, Members can add/edit only
- 6 modules: Equipment, Customers, Rentals, Payments, Maintenance, Reports

---

## Step 1 — Database (Supabase, free)

1. Go to https://supabase.com → New project
2. Choose a name (e.g. centring-tracker) and set a DB password
3. Wait for it to start, then go to **Project Settings → Database**
4. Copy the **Connection String (URI)** — looks like:
   `postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres`
5. Keep this — you'll need it as `DATABASE_URL`

> The app auto-creates all tables on first run. No manual SQL needed.

---

## Step 2 — Backend (Railway, free)

1. Go to https://railway.app → New Project → Deploy from GitHub
2. Push `server.js` and a `package.json` (backend) to a GitHub repo
3. In Railway → Variables, add:
   ```
   DATABASE_URL = postgresql://postgres:...@db.xxx.supabase.co:5432/postgres
   JWT_SECRET   = any_long_random_string_here
   PORT         = 4000
   ```
4. Deploy. Railway gives you a URL like `https://centring-xxx.up.railway.app`

### Backend package.json
```json
{
  "name": "centring-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "socket.io": "^4.6.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1"
  }
}
```

---

## Step 3 — Frontend (Vercel, free)

1. Create a React app: `npx create-react-app centring-frontend`
2. Replace `src/App.js` → rename to `src/App.jsx`, paste `App.jsx` content
3. Copy your existing files into `src/`:
   - `src/api.js`
   - `src/context/AuthContext.js`
   - `src/context/LangContext.js`
4. Install dependencies:
   ```bash
   npm install axios socket.io-client
   npm install -D tailwindcss
   npx tailwindcss init
   ```
5. Set up Tailwind in `tailwind.config.js`:
   ```js
   module.exports = { content: ['./src/**/*.{js,jsx}'], theme: { extend: {} }, plugins: [] }
   ```
6. In `src/index.css` add at the top:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   .no-scrollbar::-webkit-scrollbar { display: none; }
   ```
7. Create `.env` in the frontend root:
   ```
   REACT_APP_API_URL=https://centring-xxx.up.railway.app
   ```
8. Push to GitHub, go to https://vercel.com → Import → add `REACT_APP_API_URL` env variable
9. Deploy

---

## Step 4 — First Login

Default credentials (auto-created):
- **Username:** `owner`
- **Password:** `owner123`

⚠️ Change this immediately after first login via Users page.

### Adding your 3 team members
1. Login as owner
2. Go to Users (☰ menu)
3. Add 3 members with role = Member

---

## File structure

```
centring-frontend/
├── src/
│   ├── App.jsx          ← main UI (the file provided)
│   ├── api.js           ← your existing file
│   ├── context/
│   │   ├── AuthContext.js  ← your existing file
│   │   └── LangContext.js  ← your existing file
│   └── index.css
├── .env
└── package.json

centring-backend/
├── server.js            ← the file provided
└── package.json
```

---

## Permissions Summary

| Action            | Owner | Member |
|-------------------|-------|--------|
| View all data     | ✅    | ✅     |
| Add / Edit        | ✅    | ✅     |
| Delete records    | ✅    | ❌     |
| View Reports      | ✅    | ❌     |
| Manage Users      | ✅    | ❌     |

---

## Real-time sync

All 4 members see updates instantly without refreshing. When any member adds a rental or payment, every open screen updates automatically via Socket.io.

The header shows how many members are currently online (e.g. "3 online").
