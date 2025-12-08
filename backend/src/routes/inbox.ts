import express from 'express';
import imapService from '../services/imapService';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const emails = await imapService.fetchInbox(limit);
    
    res.json({
      emails,
      count: emails.length,
    });
  } catch (error: any) {
    console.error('Inbox fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch inbox',
      message: error.message,
    });
  }
});

router.get('/unread', async (req, res) => {
  try {
    const count = await imapService.getUnreadCount();
    res.json({ unreadCount: count });
  } catch (error: any) {
    console.error('Unread count error:', error);
    res.status(500).json({
      error: 'Failed to get unread count',
      message: error.message,
    });
  }
});

export default router;

