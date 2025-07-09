//CRUD ops for backend management with MongoDB
const mongoose = require('mongoose');
const express = require('express');
const path = require ('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini 
const genAI = new GoogleGenerativeAI("AIzaSyAccKLci4aAOkj0mKafwS759G6OWiR-_js");

const app = express();
app.use(express.json());
mongoose.connect('mongodb+srv://Markell:6zISMfqj7k6VO0xH@clustertest.keysisg.mongodb.net/FinalPro?retryWrites=true&w=majority')

// Define our model for output
const aiOutputSchema = new mongoose.Schema({
  question: String,
  answer: String,
  createdAt: { type: Date, default: Date.now }
});
const AIOutput = mongoose.model('AIOutput', aiOutputSchema);

// POST route: receive question, generate Gemini answer, save, and return
app.post('/api/ai-output', async (req, res) => {
  try {
    const { question } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(question);
    const answer = result.response.text();

    // Save to MongoDB
    const output = new AIOutput({ question, answer });
    await output.save();

    // Send response to frontend
    res.status(201).json(output);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});