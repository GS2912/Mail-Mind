# Commands Reference

## 🚀 Setup Commands (Run Once)

### 1. Install All Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**Or use root script:**
```bash
npm run install:all
```

---

## 🏃 Development Commands

### Run Backend (Terminal 1)

```bash
cd backend
npm run dev
```

**What it does:**
- Starts Express server on `http://localhost:8000`
- Watches for file changes (auto-restart)
- Shows connection status

**Expected output:**
```
🚀 Backend server running on http://localhost:8000
✅ Connected to IMAP server
```

---

### Run Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

**What it does:**
- Starts Vite dev server on `http://localhost:5173`
- Auto-opens browser
- Hot module replacement (instant updates)

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🏗️ Build Commands

### Build Backend (Production)

```bash
cd backend
npm run build
```

**Output:** `backend/dist/` folder with compiled JavaScript

---

### Build Frontend (Production)

```bash
cd frontend
npm run build
```

**Output:** `frontend/dist/` folder with optimized production build

---

## 🎯 Production Commands

### Start Backend (Production)

```bash
cd backend
npm start
```

**Note:** Requires `npm run build` first

---

### Preview Frontend Build

```bash
cd frontend
npm run preview
```

**Note:** Requires `npm run build` first

---

## 📦 Root-Level Commands

From project root directory:

```bash
# Install all dependencies
npm run install:all

# Run backend in dev mode
npm run dev:backend

# Run frontend in dev mode
npm run dev:frontend

# Build backend
npm run build:backend

# Build frontend
npm run build:frontend

# Start backend (production)
npm run start:backend
```

---

## 🧪 Testing Commands

### Test Backend API

```bash
# Health check
curl http://localhost:8000/health

# Get inbox
curl http://localhost:8000/api/inbox

# Test agent chat
curl -X POST http://localhost:8000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

---

## 🔧 Troubleshooting Commands

### Clear Node Modules (Fresh Install)

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Check Node Version

```bash
node --version
# Should be 18+ for best compatibility
```

### Check Port Availability

```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Mac/Linux
lsof -i :8000
lsof -i :5173
```

---

## 📋 Quick Start Checklist

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Configure .env
cd backend
cp env.example .env
# Edit .env with your credentials

# 3. Start backend (Terminal 1)
cd backend
npm run dev

# 4. Start frontend (Terminal 2)
cd frontend
npm run dev

# 5. Open browser
# Should auto-open at http://localhost:5173
```

---

## 🎓 Project-Specific Commands

### Check Backend Logs

Backend logs show:
- ✅ IMAP connection status
- ✅ Email fetch operations
- ✅ Email send confirmations
- ✅ Agent tool executions
- ❌ Any errors

### Check Frontend Console

Open browser DevTools (F12) to see:
- API request/response logs
- React component errors
- Network errors

---

## 💡 Pro Tips

1. **Run in separate terminals** - Backend and frontend need separate processes
2. **Keep backend running** - Frontend depends on it
3. **Check .env file** - Most errors are from missing/wrong credentials
4. **Watch terminal logs** - They show what's happening in real-time

---

**All set!** Start with `npm run dev:backend` and `npm run dev:frontend` in separate terminals.

