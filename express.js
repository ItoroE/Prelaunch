const express = require('express');
const path = require('path');
const { google } = require('googleapis');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//email check something@something.tld, no spaces, max 254 chars
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'Sheet1';
// Quote the tab name so names with spaces (e.g. "Yuwo Waitlist") work in ranges
const TAB = `'${SHEET_NAME.replace(/'/g, "''")}'`;

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

app.post('/subscribe', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    // Skip duplicates to avoid clutter 
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${TAB}!A:A`,
    });
    const emails = (existing.data.values || []).flat();
    if (emails.includes(email)) {
      return res.json({ ok: true });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${TAB}!A:B`,
      valueInputOption: 'RAW',
      requestBody: { values: [[email, new Date().toISOString()]] },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Google Sheets error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
