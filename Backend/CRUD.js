require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define model for output
const aiOutputSchema = new mongoose.Schema({
  question: String,
  answer: String,
  createdAt: { type: Date, default: Date.now }
});
const AIOutput = mongoose.model('AIOutput', aiOutputSchema);

// POST route
app.post('/api/ai-output', async (req, res) => {
  try {
    const { question } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(question);
    const answer = result.response.text();

    const output = new AIOutput({ question, answer });
    await output.save();

    res.status(201).json(output);
  } catch (err) {
    // Detect quota limit and suggest fallback
    if (err.message.includes("429")) {
      return res.status(429).json({
        error: "Rate limit exceeded for gemini-1.5-pro. Try again later or switch to gemini-pro.",
        info: "https://ai.google.dev/gemini-api/docs/rate-limits"
      });
    }

    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
