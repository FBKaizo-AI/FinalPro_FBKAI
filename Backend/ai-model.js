// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
import { GoogleGenAI } from "@google/genai";
const Monster = require('./monster-model'); // Mongoose model for Monsters

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files from /public
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Connection, since we have no specific URI variable
const MONGO_URI = process.env.DUSTIN_MONGO || process.env.MARKELL_MONGO || process.env.JIYAH_MONGO;
if (!MONGO_URI) {
  console.error("MongoDB connection string is missing in .env (DUSTIN_MONGO / MARKELL_MONGO / JIYAH_MONGO).");
  process.exit(1); // Stops server if no URI is set
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Initialize Gemini AI with API Key
const ai = new GoogleGenAI({ apikey: process.env.GEMINI_API_KEY });

// Mongoose Schema to store AI responses
const aiOutputSchema = new mongoose.Schema({
  question: String,
  answer: String,
  createdAt: { type: Date, default: Date.now }
});
const AIOutput = mongoose.model('FBKaizo', aiOutputSchema, 'FBKaizo');

// POST endpoint: Receives a user question, queries Gemini AI, saves response
app.post('/api/ai-output', async (req, res) => {
  try {
    const { question } = req.body;

    // Search for matching monsters in DB
    const monsterMatches = await Monster.find({
      name: { $regex: question, $options: 'i' }
    }).limit(3);

    // Build context for Gemini API
    let context = 'Here is monster info from the database:\n';
    monsterMatches.forEach(mon => {
      context += `Name: ${mon.name}\nStats: ${mon.stats}\nAbilities: ${mon.abilities}\n\n`;
    });
    context += `User question: ${question}\nAI answer:`;

    // Generate AI response
    const result = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: context,
   const: answer = result.text() 

});


    // Save response to MongoDB
    const output = new AIOutput({ question, answer });
    await output.save();

    res.status(201).json(output);
 } catch (err) {
    if (err.message.includes('429')) {
      return res.status(429).json({
        error: 'Rate limit exceeded for gemini-2.5-flash. Try again later.',
        info: 'https://ai.google.dev/gemini-api/docs/rate-limits'
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET endpoint: Returns all saved AI responses
app.get('/api/ai-history', async (req, res) => {
  try {
    const data = await AIOutput.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all route: Serve index.html for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
