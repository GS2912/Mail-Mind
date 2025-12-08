import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string, html?: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject,
        text: body,
        html: html || body.replace(/\n/g, '<br>'),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
    } catch (error) {
      console.error('❌ Email send error:', error);
      throw error;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ SMTP verification error:', error);
      return false;
    }
  }
}

export default new EmailService();

