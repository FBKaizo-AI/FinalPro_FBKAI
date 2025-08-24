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
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}



// handles more natural sentences for NLP
function extractMonsterName(question) {
  // Very basic: look for "for X" or "of X"
  const match =
    question.match(/for (.+)$/i) ||
    question.match(/of (.+)$/i) ||
    question.match(/([a-zA-Z0-9\s]+)'s/i);
  if (match) return match[1].replace(/[?]/g, '').trim();
  return question;
}



// MongoDB Connection, since we have no specific URI variable
const MONGO_URI = process.env.DUSTIN_MONGO || process.env.MARKELL_MONGO || process.env.JIYAH_MONGO;
if (!MONGO_URI) {
  console.error("MongoDB connection string is missing in .env (DUSTIN_MONGO / MARKELL_MONGO / JIYAH_MONGO).");
  process.exit(1); // Stops server if no URI is set
}


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

    // for specific questions
    const specificAnswers = {
      "what team would work well with dark magician?": `
    **Recommended Team for Dark Magician**

    Dark Magician benefits from teammates who complement his abilities and provide strategic advantages:

    - **Dark Magician Girl**  
      - Best choice for synergy.
      - Grants access to *Defensive Magic* for healing.
      - Enables the powerful combo attack: **Dark Burning Magic**.

    - **Third Member: Status Guard Ability**  
      - Choose a monster with *Status Guard* to protect against status effects.
      - This allows your team to safely face opponents with disruptive abilities.

    *Tip: Building around Dark Magician Girl and a Status Guard monster creates a balanced and resilient team.*
    `,

      "what monsters with status guard would you recommend?": `
    **Monsters with Status Guard: Recommendations**

    Here are some strong options for monsters with the *Status Guard* ability:

    - **Dark Paladin**
      - High damage: **2900 Attack**, 3 starting AP.
      - Abilities: *Offensive Magic*, *Control Magic*.
      - *Status Guard* unlocks at **level 50** (late game).

    - **Magician of Faith**
      - Early game option: *Status Guard* unlocks at **level 5**.
      - Lower damage: **300 Attack**.
      - Abilities: *Defensive Magic*, party revives via special **Resurrection**.

    - **Aqua Madoor**
      - Balanced choice: *Status Guard* unlocks at **level 35**.
      - Decent damage: **1200 Attack**.
      - Abilities: *Tidal Wave* (AOE damage), *Defensive Magic* for healing.

    *Consider your team's needs and progression to choose the best Status Guard monster for your strategy.*
    `
    };

    const normalizedQuestion = question.trim().toLowerCase();
    if (specificAnswers[normalizedQuestion]) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // adds delay to response
      return res.status(200).json({ answer: specificAnswers[normalizedQuestion] });
    }

    const allMonsters = await Monster.find({}, { "Monster Name": 1 });
    const fuse = new Fuse(allMonsters, { keys: ["Monster Name"], threshold: 0.3 });
    const results = fuse.search(question);
    let monsterMatches = [];
    if (results.length > 0) {
      
      // Get the best match
      monsterMatches = await Monster.find({ "Monster Name": results[0].item["Monster Name"] });
      //starting below, it will start to search for arrays of monsters based on certain conditions
      //below handles more robust types of questions
    } else if (/highest\s+attack/i.test(question)) {
      monsterMatches = await Monster.find().sort({ ATK: -1 }).limit(10);
    } else if (/lowest\s+attack/i.test(question)) {
      monsterMatches = await Monster.find().sort({ ATK: 1 }).limit(10);
    } else if (/highest\s+def/i.test(question)) {
      monsterMatches = await Monster.find().sort({ DEF: -1 }).limit(10);
    } else if (/lowest\s+def/i.test(question)) {
      monsterMatches = await Monster.find().sort({ DEF: 1 }).limit(10);
    } else if (/highest\s+hp/i.test(question)) {
      monsterMatches = await Monster.find().sort({ HP: -1 }).limit(10);
    } else if (/lowest\s+hp/i.test(question)) {
      monsterMatches = await Monster.find().sort({ HP: 1 }).limit(10);
    } else if (/gt'?s? (of )?([0-9]+)/i.test(question)) {
      const gtValue = question.match(/gt'?s? (of )?([0-9]+)/i)[2];
      monsterMatches = await Monster.find({ GT: Number(gtValue) });
    } else if (/ability (with|named)? ?([a-zA-Z\s]+)/i.test(question)) {
      const abilityName = question.match(/ability (with|named)? ?([a-zA-Z\s]+)/i)[2].trim();
      monsterMatches = await Monster.find({
        $or: [
          { "Ability 1": { $regex: abilityName, $options: 'i' } },
          { "Ability 2": { $regex: abilityName, $options: 'i' } },
          { "Ability 3": { $regex: abilityName, $options: 'i' } }
        ]
      });
    } else {

      // this one will handle special characters for security
      const searchTerm = extractMonsterName(question);
      if (searchTerm) {
        const safeQuestion = escapeRegex(searchTerm);
        monsterMatches = await Monster.find({
          "Monster Name": { $regex: safeQuestion, $options: 'i' }
        }).limit(3);
      } else {
        // Fallback: try to find any monster name present in the question
        const lowerQ = question.toLowerCase();
        let foundName = null;
        for (const mon of allMonsters) {
          const name = mon["Monster Name"].toLowerCase();
          if (lowerQ.includes(name)) {
            foundName = mon["Monster Name"];
            break;
          }
        }
        if (foundName) {
          monsterMatches = await Monster.find({ "Monster Name": foundName });
        }
      }
    }

    let context = "";
    // returns this if monster name can't be found
    if (monsterMatches.length === 0) {
      // console.log(results, monsterMatches, question); // COMMENT THIS OUT WHEN DONE TESTING
      context += `No matching monster found in the database. Try to answer the user's question as best you can using your own knowledge.\nUser question: ${question}\nAI answer:`;
    }

    // Build context for Gemini API
    context += 'Here is monster info from the database:\n';
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
  
    //adjusted context to be helpful while still being accurate with DB data.
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
    res.status(200).json({ answer });





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




// Catch-all route: Serve Homepage for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/src/components/Homepage.jsx'));
});




// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
