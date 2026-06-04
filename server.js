const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── FEEDBACK STORAGE ──
const FEEDBACK_FILE = path.join(__dirname, 'feedback.json');

function loadFeedback() {
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      return JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
    }
  } catch(e) {}
  return [];
}

function saveFeedback(data) {
  try { fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2)); } catch(e) {}
}

// POST /api/feedback — submit new feedback
app.post('/api/feedback', (req, res) => {
  const { name, message } = req.body;
  if (!name || !name.trim() || !message || !message.trim()) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }
  const data = loadFeedback();
  const entry = {
    id: Date.now(),
    name: name.trim(),
    message: message.trim(),
    date: new Date().toISOString()
  };
  data.push(entry);
  saveFeedback(data);
  res.json({ success: true });
});

// GET /api/feedback — retrieve all feedback (password protected)
app.get('/api/feedback', (req, res) => {
  const { password } = req.query;
  if (password !== 'thrive years') {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  res.json(loadFeedback());
});

// DELETE /api/feedback/:id — delete a single entry (password protected)
app.delete('/api/feedback/:id', (req, res) => {
  const { password } = req.query;
  if (password !== 'thrive years') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const id = parseInt(req.params.id);
  let data = loadFeedback();
  data = data.filter(f => f.id !== id);
  saveFeedback(data);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Thrive Years running → http://localhost:${PORT}`));
