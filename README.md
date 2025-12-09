# 📧 AI Email Assistant

A full-stack AI-powered email management system that fetches real emails, provides smart summaries, generates quick replies, and includes an intelligent chat agent.

## 🎯 Features

- ✅ **Real Email Access**: Fetches live emails from your inbox via IMAP
- ✅ **Send Real Emails**: Send emails via SMTP
- ✅ **AI-Powered Analysis**: Summarizes inbox, detects urgent emails, identifies pending replies
- ✅ **Smart Quick Replies**: One-click reply generation (Acknowledge, Ask Update, Confirm, Decline)
- ✅ **Chat Agent**: Interactive AI assistant that can draft emails, check inbox, and answer questions
- ✅ **LLM Function Tool Calling**: Uses Local LLM exposed via FastAPI with function calling for intelligent email management

## 🏗️ Project Structure

```
College-Email-Project/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── imapService.ts      # IMAP email fetching
│   │   │   ├── emailService.ts     # SMTP email sending
│   │   │   └── agentService.ts     # agent with tool calling
│   │   ├── routes/
│   │   │   ├── inbox.ts            # /api/inbox endpoints
│   │   │   ├── email.ts            # /api/email/send endpoint
│   │   │   └── agent.ts            # /api/agent/chat endpoint
│   │   └── index.ts                # Express server
│   ├── .env                        # Your email credentials (create this)
│   ├── .env.example                # Template for .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Inbox.tsx           # Inbox Analyzer page
│   │   │   └── Chat.tsx            # Chat Agent page
│   │   ├── services/
│   │   │   └── api.ts              # API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ installed
- An email account (Gmail recommended)
- OpenAI API key

### Step 1: Get Email Credentials

#### For Gmail Users:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Your Gmail credentials**:
   - `IMAP_HOST=imap.gmail.com`
   - `IMAP_PORT=993`
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `IMAP_USER=your-email@gmail.com`
   - `SMTP_USER=your-email@gmail.com`
   - `IMAP_PASS=your-16-char-app-password`
   - `SMTP_PASS=your-16-char-app-password`

#### For Other Email Providers:

**Outlook/Hotmail:**
- IMAP: `outlook.office365.com:993`
- SMTP: `smtp.office365.com:587`

**Yahoo:**
- IMAP: `imap.mail.yahoo.com:993`
- SMTP: `smtp.mail.yahoo.com:587`

**Custom IMAP/SMTP:**
- Check your email provider's documentation for IMAP/SMTP settings

### Step 2: Get OpenAI API Key (if using OpenAI APIs)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-...`)

### Step 3: Configure Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and fill in your credentials:
   ```env
   # IMAP Configuration
   IMAP_HOST=imap.gmail.com
   IMAP_PORT=993
   IMAP_USER=your-email@gmail.com
   IMAP_PASS=your-app-password-here

   # SMTP Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password-here

   # OpenAI API Key
   OPENAI_API_KEY=sk-your-openai-api-key-here

   # Server Port (optional)
   PORT=8000
   ```

### Step 4: Configure Frontend

1. Navigate to frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Step 5: Run the Application

#### Option 1: Run Separately (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173` and auto-open in browser

#### Option 2: Use Root Scripts (if you add them)

You can also create a root `package.json` to run both:

```bash
# In project root
npm run dev:backend  # Runs backend
npm run dev:frontend # Runs frontend
```

## 📋 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `IMAP_HOST` | IMAP server hostname | `imap.gmail.com` |
| `IMAP_PORT` | IMAP server port (usually 993) | `993` |
| `IMAP_USER` | Your email address | `your-email@gmail.com` |
| `IMAP_PASS` | App password or email password | `abcd efgh ijkl mnop` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port (587 or 465) | `587` |
| `SMTP_USER` | Your email address | `your-email@gmail.com` |
| `SMTP_PASS` | App password or email password | `abcd efgh ijkl mnop` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `8000` |

## 🎮 Usage

### Inbox Analyzer Page

1. **View Inbox**: Automatically loads and displays your real emails
2. **AI Summary**: See AI-generated summary of your inbox
3. **Categories**: Emails are categorized into:
   - 🔴 **Urgent**: Needs immediate attention
   - ⏳ **Pending Replies**: Emails requiring your response
   - ℹ️ **Informational**: General emails
4. **Quick Replies**: Click any of the quick reply buttons:
   - **Acknowledge**: Brief acknowledgment
   - **Ask Update**: Request for update
   - **Confirm**: Confirmation email
   - **Decline**: Polite decline
5. **Send Emails**: Review AI-generated draft, edit if needed, and send

### Chat Agent Page

Ask the AI assistant questions like:
- "What is urgent today?"
- "Draft a short email to professor about project submission"
- "Who hasn't replied yet?"
- "Summarize last 10 emails"
- "Show me unread emails"

The agent uses tool calling to:
- Fetch your real inbox
- Send emails on your behalf
- Extract contacts
- Analyze email patterns

## 🔧 API Endpoints

### `GET /api/inbox`
Fetches inbox emails
- Query params: `?limit=50` (optional)
- Returns: `{ emails: Email[], count: number }`

### `POST /api/email/send`
Sends an email
- Body: `{ to: string, subject: string, body: string, html?: string }`
- Returns: `{ success: true, message: string }`

### `POST /api/agent/chat`
Chat with AI agent
- Body: `{ message: string, history?: ChatMessage[] }`
- Returns: `{ reply: string, toolExecuted?: object, history: ChatMessage[] }`

## 🛠️ Troubleshooting

### IMAP Connection Issues

- **Error: "Authentication failed"**
  - Verify your email and password are correct
  - For Gmail, ensure you're using an App Password, not your regular password
  - Check if 2FA is enabled (required for App Passwords)

- **Error: "Connection timeout"**
  - Check your internet connection
  - Verify IMAP_HOST and IMAP_PORT are correct
  - Some networks block IMAP ports; try a different network

### SMTP Sending Issues

- **Error: "Invalid login"**
  - Use App Password for Gmail
  - Verify SMTP_USER and SMTP_PASS match
  - Check SMTP_PORT (587 for TLS, 465 for SSL)

- **Error: "Message rejected"**
  - Some providers have sending limits
  - Check spam folder settings
  - Verify recipient email is valid

### OpenAI API Issues

- **Error: "Invalid API key"**
  - Verify your API key starts with `sk-`
  - Check if you have credits in your OpenAI account
  - Ensure the key has not been revoked

### Frontend Not Connecting

- **Error: "Network Error" or CORS issues**
  - Ensure backend is running on port 8000
  - Check browser console for errors
  - Verify `API_BASE_URL` in `frontend/src/services/api.ts` matches your backend URL

## 📝 Notes

- **Email Limits**: Some providers limit IMAP connections. If you see connection errors, wait a few minutes and try again.
- **Rate Limiting**: If you are using OpenAI API, it has rate limits. If you hit limits, wait before making more requests. If you are using local LLM you are set.


---

**Happy Email Managing! 📧✨**


