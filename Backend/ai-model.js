// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const Monster = require('./monster-model'); // Mongoose model for Monsters
const Fuse = require ('fuse.js');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files from /public
app.use(express.static(path.join(__dirname, '../public')));

// helps prevent server from crashing from unhandled rejections outside of try/catch
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// limits users to rates based on IP
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20 // limit each IP to 20 requests per windowMs
});
app.use(limiter);

// handles special characters so malicious code can't be entered
function escapeRegex(str) {
  console.log('[escapeRegex] input:', str);
  const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  console.log('[escapeRegex] output:', escaped);
  return escaped;
}

// handles more natural sentences for NLP
function extractMonsterName(question) {
  console.log('[extractMonsterName] input question:', question);
  const match = question.match(/for (.+)$/i) || question.match(/of (.+)$/i);
  if (match) {
    const extracted = match[1].replace(/[?]/g, '').trim();
    console.log('[extractMonsterName] extracted:', extracted);
    return extracted;
  }
  console.log('[extractMonsterName] no extraction, return original');
  return question;
}

// MongoDB Connection, since we have no specific URI variable
const MONGO_URI = process.env.DUSTIN_MONGO || process.env.MARKELL_MONGO || process.env.JIYAH_MONGO;
if (!MONGO_URI) {
  console.error("MongoDB connection string is missing in .env (DUSTIN_MONGO / MARKELL_MONGO / JIYAH_MONGO).");
  process.exit(1); // Stops server if no URI is set
}
console.log('[MongoDB] Using URI:', MONGO_URI);

// connecting to mongodb
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Initialize Gemini AI with API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// POST endpoint: Receives a user question, queries Gemini AI, saves response
app.post('/api/ai-output', async (req, res) => {
  try {
    const { question } = req.body;
    console.log('[POST /api/ai-output] Received question:', question);

    if (!question) {
      console.log('[POST /api/ai-output] Missing question in request body');
      return res.status(400).json({ error: 'Question is required.' });
    }

    const allMonsters = await Monster.find({}, { "Monster Name": 1 });
    console.log(`[POST /api/ai-output] Retrieved ${allMonsters.length} monsters from DB`);

    const fuse = new Fuse(allMonsters, { keys: ["Monster Name"], threshold: 0.3 });
    const results = fuse.search(question);
    console.log('[POST /api/ai-output] Fuse search results:', results);

    let monsterMatches = [];
    if (results.length > 0) {
      // Get the best match
      monsterMatches = await Monster.find({ "Monster Name": results[0].item["Monster Name"] });
      console.log(`[POST /api/ai-output] Found ${monsterMatches.length} monster(s) matching Fuse result`);
    } else if (/highest\s+attack/i.test(question)) {
      // this one can create an array of monsters for highest atk for testing
      monsterMatches = await Monster.find().sort({ ATK: -1 }).limit(10);
      console.log(`[POST /api/ai-output] Found ${monsterMatches.length} monsters for highest attack query`);
    } else {
      // this one will handle special characters for security
      let searchTerm = extractMonsterName(question);
      const safeQuestion = escapeRegex(searchTerm);
      monsterMatches = await Monster.find({
        "Monster Name": { $regex: safeQuestion, $options: 'i' }
      }).limit(3);
      console.log(`[POST /api/ai-output] Found ${monsterMatches.length} monsters for regex search`);
    }

    // returns this if monster name can't be found
    if (monsterMatches.length === 0) {
      console.log('[POST /api/ai-output] No matching monster found:', results, monsterMatches, question);
      return res.status(404).json({ answer: "No matching monster found in the database." });
    }

    // Build context for Gemini API
    let context = 'Here is monster info from the database:\n';
    monsterMatches.forEach(mon => {
      context += `Name: ${mon["Monster Name"]}\n`;
      context += `Class: ${mon.Class}\n`;
      context += `HP: ${mon.HP}, ATK: ${mon.ATK}, DEF: ${mon.DEF}, AP: ${mon.AP}, GT: ${mon.GT}, Luck: ${mon.Luck}, Speed: ${mon.Speed}\n`;
      context += `Battle Art: ${mon["Attack Effect"]}\n`;
      context += `Special Name: ${mon["Special Name"]}\n`;
      context += `Special Effect: ${mon["Special Effect"]}\n`;
      context += `Ability 1: ${mon["Ability 1"]}\n`;
      context += `Ability 2: ${mon["Ability 2"]}\n`;
      context += `Ability 3: ${mon["Ability 3"]}\n\n`;
    });
    console.log('[POST /api/ai-output] Built context for AI with monster data');

    context += `Using the monster info above, respond to the user's question with relevant data for an accurate answer. 
                Be detailed, but format your response in clear sections using Markdown. 
                Use bullet points, bold for stat names, and short paragraphs under each section. 
                Do not output giant blocks of text — break them up with line breaks.

                User question: ${question}

                AI answer:`;

    // Generate AI response
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: context }] }]
    });
    const answer = result.candidates?.[0]?.content?.parts?.[0]?.text || "No answer generated.";
    console.log('[POST /api/ai-output] AI generated answer:', answer);

    res.status(200).json({ answer });

  } catch (err) {
    if (err.message.includes('429')) {
      console.log('[POST /api/ai-output] Rate limit exceeded');
      return res.status(429).json({
        error: 'Rate limit exceeded for gemini-2.5-flash. Try again later.',
        info: 'https://ai.google.dev/gemini-api/docs/rate-limits'
      });
    }
    console.error('[POST /api/ai-output] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Catch-all route: Serve index.html for any unmatched route
app.get('*', (req, res) => {
  console.log('[GET *] Serving index.html');
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
