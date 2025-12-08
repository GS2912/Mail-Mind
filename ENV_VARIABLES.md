# Environment Variables Guide

## 📋 Required Environment Variables

All variables go in `backend/.env` file.

### Email Configuration (IMAP - For Receiving)

| Variable | Description | Where to Get | Example |
|----------|-------------|--------------|---------|
| `IMAP_HOST` | IMAP server address | Email provider docs | `imap.gmail.com` |
| `IMAP_PORT` | IMAP port (usually 993) | Email provider docs | `993` |
| `IMAP_USER` | Your email address | Your email account | `yourname@gmail.com` |
| `IMAP_PASS` | Email password or App Password | See below | `abcd efgh ijkl mnop` |

### Email Configuration (SMTP - For Sending)

| Variable | Description | Where to Get | Example |
|----------|-------------|--------------|---------|
| `SMTP_HOST` | SMTP server address | Email provider docs | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port (587 or 465) | Email provider docs | `587` |
| `SMTP_USER` | Your email address | Your email account | `yourname@gmail.com` |
| `SMTP_PASS` | Email password or App Password | See below | `abcd efgh ijkl mnop` |

### AI Configuration

| Variable | Description | Where to Get | Example |
|----------|-------------|--------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | OpenAI Platform | `sk-proj-...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `8000` |

---

## 🔑 How to Get Each Value

### 1. Gmail App Password (IMAP_PASS & SMTP_PASS)

**Steps:**
1. Go to https://myaccount.google.com/
2. Click **Security** (left sidebar)
3. Under "How you sign in to Google", click **2-Step Verification**
4. Scroll down and click **App passwords**
5. Select:
   - App: **Mail**
   - Device: **Other (Custom name)** → Type "Email Assistant"
6. Click **Generate**
7. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
8. **Important**: Remove spaces when pasting into `.env` file

**Example:**
```
IMAP_PASS=abcdefghijklmnop
SMTP_PASS=abcdefghijklmnop
```

**Note:** If you don't have 2FA enabled, you'll need to enable it first.

---

### 2. OpenAI API Key (OPENAI_API_KEY)

**Steps:**
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Click your profile icon (top right) → **API keys**
4. Click **Create new secret key**
5. Give it a name (e.g., "Email Assistant")
6. Copy the key (starts with `sk-`)
7. **Important**: Save it immediately - you won't see it again!

**Example:**
```
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890
```

**Cost:** OpenAI charges per API call. Check pricing at https://openai.com/pricing
- GPT-4o: ~$0.005 per 1K input tokens, ~$0.015 per 1K output tokens
- Typical chat: $0.01-0.05 per conversation

---

### 3. Email Server Settings

#### Gmail (Recommended)
```
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

#### Outlook/Hotmail
```
IMAP_HOST=outlook.office365.com
IMAP_PORT=993
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
```

#### Yahoo
```
IMAP_HOST=imap.mail.yahoo.com
IMAP_PORT=993
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

#### Custom Email Provider
- Check your email provider's documentation
- Look for "IMAP settings" and "SMTP settings"
- Common ports: 993 (IMAP SSL), 587 (SMTP TLS), 465 (SMTP SSL)

---

## 📝 Complete .env File Example

Create `backend/.env` with this content:

```env
# IMAP Configuration (Receiving Emails)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=yourname@gmail.com
IMAP_PASS=your16characterapppassword

# SMTP Configuration (Sending Emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourname@gmail.com
SMTP_PASS=your16characterapppassword

# OpenAI API Key
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Server Port (Optional)
PORT=8000
```

---

## ✅ Verification Commands

After setting up `.env`, test the configuration:

### Test Backend Connection
```bash
cd backend
npm run dev
```

Look for:
- ✅ `Connected to IMAP server` (IMAP working)
- ✅ No authentication errors (credentials correct)

### Test Frontend
```bash
cd frontend
npm run dev
```

Open browser, click "Inbox Analyzer" - should load emails.

---

## 🔒 Security Notes

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Use App Passwords** - More secure than regular passwords
3. **Rotate API Keys** - If exposed, regenerate immediately
4. **Limit API Usage** - Set spending limits on OpenAI account

---

## 🆘 Troubleshooting

### "Authentication failed"
- ✅ Verify email address is correct
- ✅ For Gmail: Use App Password, not regular password
- ✅ Remove spaces from App Password
- ✅ Check if 2FA is enabled (required for App Passwords)

### "Connection timeout"
- ✅ Check internet connection
- ✅ Verify IMAP_HOST and IMAP_PORT
- ✅ Try different network (some block IMAP ports)
- ✅ Check firewall settings

### "Invalid API key"
- ✅ Verify key starts with `sk-`
- ✅ Check for typos or extra spaces
- ✅ Ensure OpenAI account has credits
- ✅ Verify key hasn't been revoked

---

**Need more help?** See README.md for detailed setup instructions.

