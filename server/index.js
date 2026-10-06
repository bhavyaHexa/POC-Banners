import 'dotenv/config';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import nodemailer from 'nodemailer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3001);
const maxPdfBytes = 10 * 1024 * 1024;
const allowedOrigins = new Set(
  (process.env.APP_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
);

app.use(express.json({ limit: '14mb' }));

app.use('/api', (request, response, next) => {
  const origin = request.get('origin');
  if (origin && allowedOrigins.size > 0 && !allowedOrigins.has(origin)) {
    response.status(403).json({ error: 'This origin is not allowed to send artwork.' });
    return;
  }
  next();
});

app.use('/api/share-artwork', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many artwork emails. Please try again in 15 minutes.' },
}));

app.post('/api/share-artwork', async (request, response) => {
  const { recipientName, recipientEmail, notes = '', pdfBase64 } = request.body || {};

  if (typeof recipientName !== 'string' || !recipientName.trim() || recipientName.length > 200) {
    response.status(400).json({ error: 'Enter a valid recipient name.' });
    return;
  }

  if (
    typeof recipientEmail !== 'string' ||
    recipientEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)
  ) {
    response.status(400).json({ error: 'Enter a valid recipient email address.' });
    return;
  }

  if (typeof notes !== 'string' || notes.length > 2000) {
    response.status(400).json({ error: 'Notes must be 2,000 characters or fewer.' });
    return;
  }

  if (typeof pdfBase64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(pdfBase64)) {
    response.status(400).json({ error: 'A valid artwork PDF is required.' });
    return;
  }

  const pdf = Buffer.from(pdfBase64, 'base64');
  if (
    pdf.length === 0 ||
    pdf.length > maxPdfBytes ||
    pdf.subarray(0, 5).toString('ascii') !== '%PDF-'
  ) {
    response.status(400).json({ error: 'The artwork PDF is invalid or exceeds the 10 MB limit.' });
    return;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    response.status(503).json({ error: 'Email sending is not configured on the server yet.' });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const result = await transporter.sendMail({
      from: SMTP_FROM,
      to: recipientEmail,
      subject: `Banner artwork from ${recipientName.trim()}`,
      text: [
        `Hello ${recipientName.trim()},`,
        '',
        'Please find the front and back banner artwork attached as a two-page PDF.',
        notes.trim() ? `\nNotes: ${notes.trim()}` : '',
      ].filter(Boolean).join('\n'),
      attachments: [{
        filename: 'banner-artwork-front-and-back.pdf',
        content: pdf,
        contentType: 'application/pdf',
      }],
    });

    response.status(200).json({ message: 'Artwork email sent.', messageId: result.messageId });
  } catch (error) {
    console.error('[share-artwork] Email delivery failed:', error);
    response.status(502).json({ error: 'The email could not be delivered. Check the server email settings and try again.' });
  }
});

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'API endpoint not found.' });
});

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(currentDirectory, '..', 'dist');
app.use(express.static(distDirectory));
app.get('/{*path}', (_request, response, next) => {
  response.sendFile(path.join(distDirectory, 'index.html'), (error) => {
    if (error) next();
  });
});

app.listen(port, () => {
  console.log(`Banner Designer server listening on port ${port}`);
});
