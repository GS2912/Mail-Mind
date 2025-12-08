import express from 'express';
import agentService from '../services/agentService';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
      });
    }

    const result = await agentService.chat(message, history);

    res.json(result);
  } catch (error: any) {
    console.error('Agent chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      message: error.message,
    });
  }
});

export default router;

