import OpenAI from 'openai';
import dotenv from 'dotenv';
import imapService from './imapService';
import emailService from './emailService';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ToolCallResult {
  toolExecuted?: {
    name: string;
    result: any;
  };
}

class AgentService {
  private systemPrompt = `You are an AI email management assistant. You help users manage their inbox by:
- Analyzing and summarizing their real inbox
- Detecting urgent emails and pending replies
- Generating smart replies
- Drafting emails on request
- Answering questions about their inbox

Keep responses concise and actionable. Use tools whenever you need to access real email data.`;

  // Truncate and clean email data for LLM consumption
  private prepareEmailsForLLM(emails: any[], maxEmails: number = 20, maxTextLength: number = 500): any[] {
    return emails.slice(0, maxEmails).map(email => {
      // Extract text from email - prefer text, fallback to HTML
      let emailText = email.text || '';
      if (!emailText && email.html) {
        // Strip HTML tags if we only have HTML
        emailText = email.html
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"');
      }
      
      // Clean and truncate text
      const cleanText = emailText
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .substring(0, maxTextLength);
      
      const wasTruncated = emailText.length > maxTextLength;
      
      return {
        id: email.id,
        from: email.from,
        subject: email.subject,
        date: email.date,
        unread: email.unread,
        text: cleanText + (wasTruncated ? '...' : ''),
        // Don't include HTML or full text - too large
      };
    });
  }

  // Estimate token count (rough approximation: 1 token ≈ 4 characters)
  private estimateTokens(text: string | null | undefined): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  // Truncate messages if they exceed token limit
  private truncateMessages(messages: ChatMessage[], maxTokens: number = 100000): ChatMessage[] {
    // Filter out null/undefined messages first
    const validMessages = messages.filter((msg): msg is ChatMessage => 
      msg !== null && msg !== undefined && msg.role && msg.content !== undefined
    );
    
    if (validMessages.length === 0) {
      return [];
    }
    
    let totalTokens = 0;
    const truncated: ChatMessage[] = [];
    
    // Always keep system prompt
    if (validMessages.length > 0 && validMessages[0].role === 'system') {
      truncated.push(validMessages[0]);
      totalTokens += this.estimateTokens(validMessages[0].content || '');
    }
    
    // Add messages from the end (most recent first) until we hit the limit
    for (let i = validMessages.length - 1; i >= 0; i--) {
      const msg = validMessages[i];
      if (!msg || msg.role === 'system') continue; // Already added or invalid
      
      const content = msg.content || '';
      const msgTokens = this.estimateTokens(content);
      if (totalTokens + msgTokens > maxTokens) {
        break; // Stop if adding this would exceed limit
      }
      
      truncated.push(msg);
      totalTokens += msgTokens;
    }
    
    // Reverse to get chronological order (oldest to newest)
    if (truncated.length === 0) {
      return [];
    }
    
    if (truncated.length === 1) {
      return truncated;
    }
    
    return [truncated[0], ...truncated.slice(1).reverse()];
  }

  async chat(message: string, history: ChatMessage[] = []): Promise<{ reply: string; toolExecuted?: any; history: ChatMessage[] }> {
    // Truncate history to prevent context overflow
    const truncatedHistory = this.truncateMessages(history, 50000); // Reserve space for current message and tool results
    
    // Filter out any null/undefined messages
    const cleanHistory = truncatedHistory.filter((msg): msg is ChatMessage => 
      msg !== null && msg !== undefined && msg.role && msg.content !== undefined
    );
    
    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemPrompt },
      ...cleanHistory,
      { role: 'user', content: message },
    ].filter((msg): msg is ChatMessage => 
      msg !== null && msg !== undefined && msg.role && msg.content !== undefined
    );

    const tools = [
      {
        type: 'function' as const,
        function: {
          name: 'getInbox',
          description: 'Fetches the user\'s real inbox emails. Returns list of emails with details like sender, subject, content, date, and unread status.',
          parameters: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of emails to fetch (default: 20, max: 20)',
              },
            },
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'sendEmail',
          description: 'Sends an email to the specified recipient with the given subject and body.',
          parameters: {
            type: 'object',
            properties: {
              to: {
                type: 'string',
                description: 'Recipient email address',
              },
              subject: {
                type: 'string',
                description: 'Email subject line',
              },
              body: {
                type: 'string',
                description: 'Email body text',
              },
            },
            required: ['to', 'subject', 'body'],
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'getContacts',
          description: 'Extracts unique email contacts (senders) from the inbox.',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
    ];

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages as any,
        tools: tools as any,
        tool_choice: 'auto',
      });

      const assistantMessage = response.choices[0].message;
      let toolExecuted: any = null;
      let finalReply = assistantMessage.content || '';

      // Handle tool calls
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        const toolCall = assistantMessage.tool_calls[0];
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        let toolResult: any;

        switch (functionName) {
          case 'getInbox':
            // Limit emails fetched and prepare them for LLM
            const limit = Math.min(args.limit || 20, 20); // Max 20 emails
            const emails = await imapService.fetchInbox(limit);
            const preparedEmails = this.prepareEmailsForLLM(emails, limit, 500);
            toolResult = { 
              emails: preparedEmails, 
              count: emails.length,
              note: emails.length > limit ? `Showing ${limit} of ${emails.length} emails` : undefined
            };
            toolExecuted = { name: 'getInbox', result: toolResult };
            break;

          case 'sendEmail':
            await emailService.sendEmail(args.to, args.subject, args.body);
            toolResult = { success: true, message: 'Email sent successfully' };
            toolExecuted = { name: 'sendEmail', result: toolResult };
            break;

          case 'getContacts':
            // Limit emails for contacts extraction
            const inboxEmails = await imapService.fetchInbox(50);
            const contacts = Array.from(
              new Set(inboxEmails.map(email => email.from).filter(Boolean))
            ).slice(0, 100); // Max 100 contacts
            toolResult = { contacts, count: contacts.length };
            toolExecuted = { name: 'getContacts', result: toolResult };
            break;

          default:
            toolResult = { error: 'Unknown tool' };
        }

        // Prepare tool result message - truncate if too large
        const toolResultStr = JSON.stringify(toolResult);
        const maxToolResultLength = 50000; // ~12.5k tokens
        const truncatedToolResult = toolResultStr.length > maxToolResultLength
          ? toolResultStr.substring(0, maxToolResultLength) + '... [truncated]'
          : toolResultStr;

        // Add tool result to conversation and get final response
        // Build tool messages with truncated history to ensure we don't exceed limits
        const cleanHistoryForTool = truncatedHistory
          .slice(-5)
          .filter((msg): msg is ChatMessage => 
            msg !== null && msg !== undefined && msg.role && msg.content !== undefined
          );
        
        const toolMessages: ChatMessage[] = [
          { role: 'system', content: this.systemPrompt },
          ...cleanHistoryForTool,
          { role: 'user', content: message },
          {
            role: 'assistant',
            content: assistantMessage.content || '',
          },
          {
            role: 'user',
            content: `Tool ${functionName} executed. Result: ${truncatedToolResult}`,
          },
        ].filter((msg): msg is ChatMessage => 
          msg !== null && msg !== undefined && msg.role && msg.content !== undefined
        );

        const finalResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: toolMessages as any,
        });

        finalReply = finalResponse.choices[0].message.content || '';
      }

      // Limit history to prevent unbounded growth (keep last 20 messages)
      // Filter and clean history before adding new messages
      const cleanHistory = history
        .slice(-18)
        .filter((msg): msg is ChatMessage => 
          msg !== null && msg !== undefined && msg.role && msg.content !== undefined && msg.content !== null
        )
        .map(msg => ({
          role: msg.role,
          content: String(msg.content || '')
        }));
      
      const updatedHistory: ChatMessage[] = [
        ...cleanHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: finalReply },
      ].filter((msg): msg is ChatMessage => 
        msg !== null && msg !== undefined && msg.role && msg.content !== undefined && msg.content !== null
      );

      return {
        reply: finalReply,
        toolExecuted,
        history: updatedHistory,
      };
    } catch (error) {
      console.error('❌ Agent error:', error);
      throw error;
    }
  }
}

export default new AgentService();

