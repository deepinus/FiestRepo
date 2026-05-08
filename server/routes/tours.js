const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOUR_PROMPT = (city, country) => `You are an expert local tour guide. Generate exactly 3 distinct sightseeing walking tours for ${city}${country ? ', ' + country : ''}. Each tour must have a different theme.

Return ONLY valid JSON with no extra text, matching this exact structure:
{
  "city": "${city}",
  "country": "${country || ''}",
  "tours": [
    {
      "id": "tour-1",
      "name": "Tour Name",
      "theme": "Theme (e.g. Historic, Cultural, Modern, Nature, Food)",
      "description": "2-3 sentence engaging description for tourists.",
      "difficulty": "Easy",
      "estimatedDuration": "2 hours",
      "totalDistance": "2.5 km",
      "color": "#f59e0b",
      "stops": [
        {
          "id": "stop-1-1",
          "order": 1,
          "name": "Landmark Name",
          "lat": 0.0000,
          "lng": 0.0000,
          "description": "One sentence description.",
          "audio": {
            "intro": "Welcome to [name]. 1-2 sentences of what you are seeing right now.",
            "history": "2-3 sentences of fascinating history about this place.",
            "facts": "2-3 surprising or little-known facts visitors love to hear.",
            "tips": "1-2 practical visitor tips: best photo spots, what to try, when to visit."
          }
        }
      ]
    }
  ]
}

Requirements:
- Each tour must have exactly 4 to 5 stops
- All stops must be real, well-known landmarks with ACCURATE GPS coordinates
- Stops within each tour must be walkable from each other (within 1-2 km total)
- Tours should cover different neighborhoods or themes so they complement each other
- The three tour colors must be: "#f59e0b" for tour-1, "#38bdf8" for tour-2, "#a78bfa" for tour-3
- Audio content should be spoken in second person ("you are standing...", "notice the...")
- Keep each audio section to 2-4 sentences — they will be read aloud via text-to-speech
- Use real accurate coordinates for ${city}`;

router.post('/generate', async (req, res) => {
  const { city, country } = req.body;

  if (!city || typeof city !== 'string') {
    return res.status(400).json({ error: 'city is required' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      messages: [{ role: 'user', content: TOUR_PROMPT(city.trim(), (country || '').trim()) }],
    });

    const text = message.content[0].text.trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      return res.status(500).json({ error: 'Invalid response from AI' });
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    res.json(parsed);
  } catch (err) {
    console.error('Tour generation error:', err.message);
    res.status(500).json({ error: 'Failed to generate tours. Please try again.' });
  }
});

module.exports = router;
