require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const cors = require('cors');
const Monster = require('./monster-model'); 

const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(cors());
app.use(express.json());

//processing env variables (refer to blueprint provided)
const MARKELL = process.env.MARKELL_MONGO;
const DUSTIN = process.env.DUSTIN_MONGO;
const JIYAH = process.env.JIYAH_MONGO;
const db = process.env.DB;
const COLL = process.env.COLLECTION;

// Connect to MongoDB
mongoose.connect(DUSTIN, {
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Initialize Gemini
const ai = new GoogleGenAI({apikey: process.env.GEMINI_API_KEY});

//testing response
async function test () {
  const response =  await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in just a few words",
    config: {
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    }  //we can adjust the thinking, since more thinking can increase response time and potentially token use
  });
  console.log(response.text);
  await console.log("AI response workin");
};

test();

// Define model for output
const aiOutputSchema = new mongoose.Schema({
  question: String,
  answer: String,
  createdAt: { type: Date, default: Date.now }
});
const AIOutput = mongoose.model('FBKaizo', aiOutputSchema, 'FBKaizo');


// POST route
app.post('/api/ai-output', async (req, res) => {
  try {
    const { question } = req.body;

    // Find monsters related to the query using the Database
    const monsterMatches = await Monster.find({
      name: { $regex: question, $options: 'i' }
    }).limit(3);

    // Build context for Gemini to find the matching monsters based on query
    let context = "Here is monster info from the database:\n";
    monsterMatches.forEach(mon => {
      context += `Name: ${mon.name}\nStats: ${mon.stats}\nAbilities: ${mon.abilities}\n\n`;
    });
    context += `User question: ${question}\nAI answer:`;

    // giving the ai context for their response
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(context);
    const answer = result.response.text();
   // saves the response to the database
    const output = new AIOutput({ question, answer });
    await output.save();
    res.status(201).json(output);
  } catch (err) {
    
    if (err.message.includes("429")) {
      return res.status(429).json({
        error: "Rate limit exceeded for gemini-2.5-flash. Try again later or switch to gemini-pro.",
        info: "https://ai.google.dev/gemini-api/docs/rate-limits"
      });
    }

    res.status(500).json({ error: err.message });
  }
});

//testing db connection
app.get("/", async (req, res) => {
  try {
    const data = await AIOutput.find(); // Fetch all documents from the collection
    res.status(200).send(data);
  } catch (error) {
    console.error(`CODE MACHINE BROKE: ERROR ${error}`);
    res.status(500).send({ error: error.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
