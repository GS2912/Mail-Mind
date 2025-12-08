import { useState, useEffect } from 'react';
import { inboxApi, emailApi, agentApi, Email } from '../services/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface EmailCategory {
  urgent: Email[];
  pending: Email[];
  informational: Email[];
}

const loadingMessages = [
  'Connecting to your inbox...',
  'Fetching emails from server...',
  'Analyzing message content...',
  'Categorizing by priority...',
  'AI is processing your emails...',
  'Almost ready...',
];

export default function Inbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<EmailCategory>({
    urgent: [],
    pending: [],
    informational: [],
  });
  const [summary, setSummary] = useState<string>('');
  const [draftingEmail, setDraftingEmail] = useState<string | null>(null);
  const [draftModal, setDraftModal] = useState<{
    show: boolean;
    to: string;
    subject: string;
    body: string;
  } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadInbox();
  }, []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const loadInbox = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inboxApi.getInbox(50);
      setEmails(data.emails);
      await analyzeInbox(data.emails);
    } catch (err: any) {
      setError(err.message || 'Failed to load inbox');
      console.error('Inbox load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeInbox = async (emailList: Email[]) => {
    try {
      const emailSummary = emailList
        .slice(0, 20)
        .map(
          (e) =>
            `From: ${e.from}, Subject: ${e.subject}, Unread: ${e.unread}, Date: ${new Date(e.date).toLocaleDateString()}`
        )
        .join('\n');

      const response = await agentApi.chat({
        message: `Analyze this inbox and categorize emails:\n\n${emailSummary}\n\nCategorize into: urgent (needs immediate attention), pending (requires reply), and informational. Also provide a brief summary.`,
        history: [],
      });

      // Parse the AI response to extract categories
      const reply = response.reply.toLowerCase();
      const urgent: Email[] = [];
      const pending: Email[] = [];
      const informational: Email[] = [];

      // Simple heuristic-based categorization (AI can improve this)
      emailList.forEach((email) => {
        const subjectLower = email.subject.toLowerCase();
        const textLower = email.text.toLowerCase();
        const isUnread = email.unread;

        if (
          isUnread &&
          (subjectLower.includes('urgent') ||
            subjectLower.includes('asap') ||
            subjectLower.includes('deadline') ||
            textLower.includes('urgent') ||
            textLower.includes('asap'))
        ) {
          urgent.push(email);
        } else if (isUnread && !email.text.toLowerCase().includes('thank you')) {
          pending.push(email);
        } else {
          informational.push(email);
        }
      });

      setCategories({ urgent, pending, informational });
      setSummary(response.reply);
    } catch (err) {
      console.error('Analysis error:', err);
      // Fallback categorization
      setCategories({
        urgent: emailList.filter((e) => e.unread).slice(0, 5),
        pending: emailList.filter((e) => e.unread).slice(5, 15),
        informational: emailList.filter((e) => !e.unread),
      });
      setSummary('Inbox loaded. Review emails below.');
    }
  };

  const handleQuickReply = async (
    email: Email,
    replyType: 'acknowledge' | 'ask-update' | 'confirm' | 'decline'
  ) => {
    try {
      setDraftingEmail(email.id);
      const prompts = {
        acknowledge: 'Draft a brief acknowledgment email',
        'ask-update': 'Draft a brief email asking for an update',
        confirm: 'Draft a brief confirmation email',
        decline: 'Draft a polite decline email',
      };

      const response = await agentApi.chat({
        message: `${prompts[replyType]} to ${email.from} regarding: ${email.subject}. Keep it professional and concise (2-3 sentences max).`,
        history: [],
      });

      const draftBody = response.reply;
      setDraftModal({
        show: true,
        to: email.from,
        subject: `Re: ${email.subject}`,
        body: draftBody,
      });
    } catch (err) {
      console.error('Draft error:', err);
      alert('Failed to generate draft');
    } finally {
      setDraftingEmail(null);
    }
  };

  const handleSendEmail = async () => {
    if (!draftModal) return;

    try {
      setSending(true);
      await emailApi.sendEmail({
        to: draftModal.to,
        subject: draftModal.subject,
        body: draftModal.body,
      });
      setDraftModal(null);
      alert('Email sent successfully!');
      loadInbox();
    } catch (err: any) {
      alert(`Failed to send email: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mailmind-bg">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-mailmind-teal/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-mailmind-teal rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-mailmind-orange/20 rounded-full"></div>
              <div className="absolute inset-2 border-4 border-transparent border-t-mailmind-orange rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-mailmind-text-light mb-4">
            {loadingMessages[loadingMessageIndex]}
          </h3>
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-mailmind-teal rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-mailmind-orange rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-mailmind-pink rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="bg-mailmind-card border border-mailmind-pink/30 rounded-xl p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-mailmind-pink/20 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-mailmind-text-light">Error</h3>
          </div>
          <p className="text-mailmind-text-muted mb-6">{error}</p>
          <button
            onClick={loadInbox}
            className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-medium transition-smooth hover:shadow-glow-orange"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-4xl font-semibold text-mailmind-text-light">Inbox Analyzer</h2>
        <button
          onClick={loadInbox}
          className="bg-mailmind-teal text-white px-6 py-3 rounded-xl font-medium transition-smooth hover:shadow-glow-teal hover:scale-105"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary Card */}
      {summary && (
        <div className="bg-mailmind-card border border-mailmind-teal/30 rounded-xl p-6 mb-8 shadow-soft">
          <h3 className="font-semibold text-mailmind-text-light mb-3 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span>AI Summary</span>
          </h3>
          <MarkdownRenderer content={summary} />
        </div>
      )}

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-mailmind-card border border-mailmind-pink/30 rounded-xl p-5 shadow-soft hover:border-mailmind-pink/50 transition-smooth">
          <h3 className="font-semibold text-mailmind-text-light mb-3 flex items-center gap-2">
            <span className="text-xl">🔴</span>
            <span>Urgent</span>
            <span className="ml-auto bg-mailmind-pink/20 text-mailmind-pink px-3 py-1 rounded-full text-sm font-medium">
              {categories.urgent.length}
            </span>
          </h3>
          <div className="space-y-3">
            {categories.urgent.slice(0, 3).map((email) => (
              <div key={email.id} className="text-sm">
                <p className="font-medium text-mailmind-text-light truncate">{email.subject}</p>
                <p className="text-xs text-mailmind-text-muted mt-1">{email.from}</p>
              </div>
            ))}
            {categories.urgent.length === 0 && (
              <p className="text-sm text-mailmind-text-muted">No urgent emails</p>
            )}
          </div>
        </div>

        <div className="bg-mailmind-card border border-mailmind-orange/30 rounded-xl p-5 shadow-soft hover:border-mailmind-orange/50 transition-smooth">
          <h3 className="font-semibold text-mailmind-text-light mb-3 flex items-center gap-2">
            <span className="text-xl">⏳</span>
            <span>Pending Replies</span>
            <span className="ml-auto bg-mailmind-orange/20 text-mailmind-orange px-3 py-1 rounded-full text-sm font-medium">
              {categories.pending.length}
            </span>
          </h3>
          <div className="space-y-3">
            {categories.pending.slice(0, 3).map((email) => (
              <div key={email.id} className="text-sm">
                <p className="font-medium text-mailmind-text-light truncate">{email.subject}</p>
                <p className="text-xs text-mailmind-text-muted mt-1">{email.from}</p>
              </div>
            ))}
            {categories.pending.length === 0 && (
              <p className="text-sm text-mailmind-text-muted">No pending replies</p>
            )}
          </div>
        </div>

        <div className="bg-mailmind-card border border-mailmind-teal/30 rounded-xl p-5 shadow-soft hover:border-mailmind-teal/50 transition-smooth">
          <h3 className="font-semibold text-mailmind-text-light mb-3 flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            <span>Informational</span>
            <span className="ml-auto bg-mailmind-teal/20 text-mailmind-teal px-3 py-1 rounded-full text-sm font-medium">
              {categories.informational.length}
            </span>
          </h3>
          <div className="space-y-3">
            {categories.informational.slice(0, 3).map((email) => (
              <div key={email.id} className="text-sm">
                <p className="font-medium text-mailmind-text-light truncate">{email.subject}</p>
                <p className="text-xs text-mailmind-text-muted mt-1">{email.from}</p>
              </div>
            ))}
            {categories.informational.length === 0 && (
              <p className="text-sm text-mailmind-text-muted">No informational emails</p>
            )}
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="bg-mailmind-card rounded-xl shadow-soft border border-mailmind-teal/20 overflow-hidden">
        <div className="p-5 border-b border-mailmind-teal/20 bg-mailmind-bg/50">
          <h3 className="text-xl font-semibold text-mailmind-text-light">
            All Emails <span className="text-mailmind-text-muted font-normal">({emails.length})</span>
          </h3>
        </div>
        <div className="divide-y divide-mailmind-teal/10">
          {emails.map((email) => (
            <div
              key={email.id}
              className={`p-5 transition-smooth hover:bg-mailmind-bg/50 ${
                email.unread ? 'bg-mailmind-teal/5 border-l-4 border-l-mailmind-teal' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {email.unread && (
                      <span className="w-2.5 h-2.5 bg-mailmind-teal rounded-full animate-pulse"></span>
                    )}
                    <p className="font-medium text-mailmind-text-light truncate">{email.from}</p>
                    <p className="text-xs text-mailmind-text-muted whitespace-nowrap">
                      {new Date(email.date).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-semibold text-mailmind-text-light mb-2">{email.subject}</p>
                  <p className="text-sm text-mailmind-text-muted line-clamp-2">
                    {email.text || email.html.replace(/<[^>]*>/g, '').substring(0, 150)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleQuickReply(email, 'acknowledge')}
                    disabled={draftingEmail === email.id}
                    className="text-xs bg-mailmind-teal/20 text-mailmind-teal px-3 py-1.5 rounded-xl hover:bg-mailmind-teal/30 transition-smooth disabled:opacity-50 font-medium"
                  >
                    {draftingEmail === email.id ? '...' : 'Acknowledge'}
                  </button>
                  <button
                    onClick={() => handleQuickReply(email, 'ask-update')}
                    disabled={draftingEmail === email.id}
                    className="text-xs bg-mailmind-orange/20 text-mailmind-orange px-3 py-1.5 rounded-xl hover:bg-mailmind-orange/30 transition-smooth disabled:opacity-50 font-medium"
                  >
                    Ask Update
                  </button>
                  <button
                    onClick={() => handleQuickReply(email, 'confirm')}
                    disabled={draftingEmail === email.id}
                    className="text-xs bg-mailmind-teal/20 text-mailmind-teal px-3 py-1.5 rounded-xl hover:bg-mailmind-teal/30 transition-smooth disabled:opacity-50 font-medium"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleQuickReply(email, 'decline')}
                    disabled={draftingEmail === email.id}
                    className="text-xs bg-mailmind-pink/20 text-mailmind-pink px-3 py-1.5 rounded-xl hover:bg-mailmind-pink/30 transition-smooth disabled:opacity-50 font-medium"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Draft Modal */}
      {draftModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-mailmind-card border border-mailmind-teal/30 rounded-xl p-6 max-w-2xl w-full shadow-soft">
            <h3 className="text-2xl font-semibold text-mailmind-text-light mb-6">Draft Email</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-mailmind-text-light mb-2">
                  To
                </label>
                <input
                  type="email"
                  value={draftModal.to}
                  onChange={(e) =>
                    setDraftModal({ ...draftModal, to: e.target.value })
                  }
                  className="w-full bg-mailmind-bg border border-mailmind-teal/30 rounded-xl px-4 py-3 text-mailmind-text-light focus:outline-none focus:border-mailmind-teal transition-smooth"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mailmind-text-light mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={draftModal.subject}
                  onChange={(e) =>
                    setDraftModal({ ...draftModal, subject: e.target.value })
                  }
                  className="w-full bg-mailmind-bg border border-mailmind-teal/30 rounded-xl px-4 py-3 text-mailmind-text-light focus:outline-none focus:border-mailmind-teal transition-smooth"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mailmind-text-light mb-2">
                  Body
                </label>
                <textarea
                  value={draftModal.body}
                  onChange={(e) =>
                    setDraftModal({ ...draftModal, body: e.target.value })
                  }
                  rows={8}
                  className="w-full bg-mailmind-bg border border-mailmind-teal/30 rounded-xl px-4 py-3 text-mailmind-text-light focus:outline-none focus:border-mailmind-teal transition-smooth resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSendEmail}
                disabled={sending}
                className="flex-1 bg-gradient-primary text-white px-6 py-3 rounded-xl font-medium transition-smooth hover:shadow-glow-orange disabled:opacity-50"
              >
                {sending ? 'Sending...' : '📧 Send'}
              </button>
              <button
                onClick={() => setDraftModal(null)}
                className="flex-1 bg-mailmind-bg border border-mailmind-text-muted/30 text-mailmind-text-light px-6 py-3 rounded-xl font-medium transition-smooth hover:border-mailmind-text-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
