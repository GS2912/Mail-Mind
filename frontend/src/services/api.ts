import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  date: Date;
  unread: boolean;
}

export interface InboxResponse {
  emails: Email[];
  count: number;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export interface ChatRequest {
  message: string;
  history?: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
  reply: string;
  toolExecuted?: {
    name: string;
    result: any;
  };
  history: Array<{ role: string; content: string }>;
}

export const inboxApi = {
  getInbox: async (limit?: number): Promise<InboxResponse> => {
    const response = await api.get<InboxResponse>('/inbox', {
      params: { limit },
    });
    return response.data;
  },
};

export const emailApi = {
  sendEmail: async (data: SendEmailRequest): Promise<void> => {
    await api.post('/email/send', data);
  },
};

export const agentApi = {
  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/agent/chat', data);
    return response.data;
  },
};

