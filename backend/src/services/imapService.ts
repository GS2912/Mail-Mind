import { ImapFlow } from 'imapflow';
// @ts-ignore - mailparser doesn't have types
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';

dotenv.config();

interface EmailData {
  id: string;
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  date: Date;
  unread: boolean;
}

class ImapService {
  private client: ImapFlow | null = null;

  async connect(): Promise<void> {
    if (this.client && this.client.authenticated) {
      return;
    }

    const config = {
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: parseInt(process.env.IMAP_PORT || '993'),
      secure: true,
      auth: {
        user: process.env.IMAP_USER || '',
        pass: process.env.IMAP_PASS || '',
      },
    };

    this.client = new ImapFlow(config);

    try {
      await this.client.connect();
      console.log('✅ Connected to IMAP server');
    } catch (error) {
      console.error('❌ IMAP connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.logout();
      this.client = null;
    }
  }

  async fetchInbox(limit: number = 10): Promise<EmailData[]> {
    if (!this.client || !this.client.authenticated) {
      await this.connect();
    }

    if (!this.client) {
      throw new Error('IMAP client not connected');
    }

    const emails: EmailData[] = [];
    const lock = await this.client.getMailboxLock('INBOX');

    try {
      // Fetch all messages
      const messages = await this.client.search({
        all: true,
      });

      // Convert to array and sort by UID (newest first)
      const messageIds = Array.isArray(messages) ? messages : [];
      
      // Reverse to get newest first (higher UID = newer)
      messageIds.reverse();
      
      // Take the first 'limit' messages
      const limitedIds = messageIds.slice(0, limit);

      // Fetch message details
      for (const msgId of limitedIds) {
        try {
          const message = await this.client.fetchOne(msgId, {
            source: true,
            flags: true,
          });

          if (message && message.source) {
            const parsed = await simpleParser(message.source);
            
            emails.push({
              id: msgId.toString(),
              from: parsed.from?.text || parsed.from?.value?.[0]?.address || 'Unknown',
              to: parsed.to?.value?.map((addr: any) => addr.address) || [],
              subject: parsed.subject || '(No Subject)',
              text: parsed.text || '',
              html: parsed.html || parsed.textAsHtml || '',
              date: parsed.date || new Date(),
              unread: !(message.flags && message.flags.has('\\Seen')),
            });
          }
        } catch (error) {
          console.error(`Error parsing message ${msgId}:`, error);
        }
      }
      
      // Sort emails by date (newest first) to ensure correct order
      emails.sort((a, b) => {
        const dateA = a.date.getTime();
        const dateB = b.date.getTime();
        return dateB - dateA; // Descending order (newest first)
      });
    } finally {
      lock.release();
    }

    return emails;
  }

  async getUnreadCount(): Promise<number> {
    if (!this.client || !this.client.authenticated) {
      await this.connect();
    }

    if (!this.client) {
      throw new Error('IMAP client not connected');
    }

    const lock = await this.client.getMailboxLock('INBOX');
    try {
      const messages = await this.client.search({
        seen: false,
      });
      return Array.isArray(messages) ? messages.length : 0;
    } finally {
      lock.release();
    }
  }
}

export default new ImapService();

