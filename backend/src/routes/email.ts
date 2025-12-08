import express from 'express';
import emailService from '../services/emailService';

const router = express.Router();

router.post('/send', async (req, res) => {
  try {
    const { to, subject, body, html } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, body',
      });
    }

    await emailService.sendEmail(to, subject, body, html);

    res.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error: any) {
    console.error('Email send error:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message,
    });
  }
});

export default router;

