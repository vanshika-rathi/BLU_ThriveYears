const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── SUPABASE CONFIG ──
const SUPABASE_URL = 'https://wowbftfeugazcmdtxtqo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indvd2JmdGZldWdhemNtZHR4dHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTM1NjAsImV4cCI6MjA5NjE2OTU2MH0.rVZD6V26f3Edv8OZEUN-leh6o70Pi1GUdxKNIa2GNis';
const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`
};

// POST /api/feedback — submit new feedback
app.post('/api/feedback', async (req, res) => {
  const { name, message } = req.body;
  if (!name || !name.trim() || !message || !message.trim()) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
      method: 'POST',
      headers: { ...HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ name: name.trim(), message: message.trim() })
    });
    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Failed to save feedback.' });
    }
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/feedback — retrieve all feedback (password protected)
app.get('/api/feedback', async (req, res) => {
  const { password } = req.query;
  if (password !== 'thriveyears') {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/feedback?select=*&order=created_at.asc`, {
      headers: { ...HEADERS, 'Accept': 'application/json' }
    });
    const text = await response.text();
    console.log('Supabase GET response:', response.status, text.substring(0, 200));
    const data = JSON.parse(text);
    res.json(data);
  } catch (e) {
    console.error('GET feedback error:', e);
    res.status(500).json({ error: 'Server error: ' + e.message });
  }
});

// DELETE /api/feedback/:id — delete a single entry (password protected)
app.delete('/api/feedback/:id', async (req, res) => {
  const { password } = req.query;
  if (password !== 'thriveyears') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/feedback?id=eq.${req.params.id}`, {
      method: 'DELETE',
      headers: HEADERS
    });
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to delete.' });
    }
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Thrive Years running → http://localhost:${PORT}`));
