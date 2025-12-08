# Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Email (Gmail Example)

1. **Enable 2FA** on your Google account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`) wlhf dsei ufwf axvw

### Step 3: Get OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it (starts with `sk-...`)

### Step 4: Create Backend .env File

```bash
cd backend
cp env.example .env
```

Edit `.env` and fill in:

```env
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=xxxx xxxx xxxx xxxx

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx

OPENAI_API_KEY=sk-your-key-here
```

### Step 5: Run the Application

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The frontend will automatically open at `http://localhost:5173`

## ✅ Verification

1. Backend should show: `🚀 Backend server running on http://localhost:8000`
2. Frontend should open in browser
3. Click "Inbox Analyzer" - it should load your real emails
4. Click "Chat Agent" - try asking "What is urgent today?"

## 🐛 Common Issues

**"Authentication failed"**
- Use App Password, not regular password
- Remove spaces from App Password in .env

**"Connection timeout"**
- Check internet connection
- Verify IMAP_HOST and IMAP_PORT

**"Invalid API key"**
- Verify key starts with `sk-`
- Check OpenAI account has credits

**Frontend can't connect**
- Ensure backend is running on port 8000
- Check browser console for errors

## 📧 Email Provider Settings

### Gmail (Recommended)
- IMAP: `imap.gmail.com:993`
- SMTP: `smtp.gmail.com:587`
- Requires: App Password

### Outlook
- IMAP: `outlook.office365.com:993`
- SMTP: `smtp.office365.com:587`

### Yahoo
- IMAP: `imap.mail.yahoo.com:993`
- SMTP: `smtp.mail.yahoo.com:587`

---

**Need help?** Check the full README.md for detailed instructions.

