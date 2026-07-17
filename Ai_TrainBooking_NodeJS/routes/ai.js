const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

// Equivalent of Django's Ai_Rcommendation view.
// Calls Gemini to produce a short explanation of the selected seat
// recommendation. Fails gracefully (200 with ok:false) instead of
// throwing, so the booking flow never breaks because of this optional
// feature — same behavior as the Django version.
router.post('/api/ai-recommendation', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({
      ok: false,
      message: 'AI insight is unavailable right now (no GEMINI_API_KEY configured on the server).',
    });
  }

  const {
    train_name: trainName = 'the selected train',
    from_station: fromStation = '',
    to_station: toStation = '',
    seats = [],
    preferences = {},
  } = req.body || {};

  const prompt =
    'You are a helpful train-booking assistant. In 2 short sentences, ' +
    'written directly to the passenger, explain why the following seat ' +
    'choice is a good match for their trip.\n' +
    `Train: ${trainName} (${fromStation} to ${toStation})\n` +
    `Recommended seats: ${JSON.stringify(seats)}\n` +
    `Passenger preferences: ${JSON.stringify(preferences)}\n` +
    'Keep it friendly and concise, no markdown.';

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // swap for a newer model name if you have access to one
      contents: prompt,
    });
    return res.json({ ok: true, message: response.text });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return res.json({
      ok: false,
      message: 'AI insight is temporarily unavailable, please try again.',
    });
  }
});

module.exports = router;
