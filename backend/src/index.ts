import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import inboxRoutes from './routes/inbox';
import emailRoutes from './routes/email';
import agentRoutes from './routes/agent';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/inbox', inboxRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/agent', agentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

