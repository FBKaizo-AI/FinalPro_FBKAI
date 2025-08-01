require('dotenv').config();
console.log("MONGO_URI:", process.env.MONGO_URI);
const { MongoClient } = require('mongodb');
const { get } = require('mongoose');
const mongoose = require('mongoose');   
const uri = process.env.MARKELL_MONGO;
const client = new MongoClient(uri);


const MARKELL = process.env.MARKELL_MONGO;
const DUSTIN = process.env.DUSTIN_MONGO;
const JIYAH = process.env.JIYAH_MONGO;
const db = process.env.DB;
const COLL = process.env.COLLECTION;

async function getMonsterStatsAtLevel(monsterName, level) {
    try {
        await mongoose.connect(MARKELL, {
        }).then(() => console.log("MongoDB connected"))
        .catch((err) => console.error("MongoDB connection error:", err));

        const db = client.db(process.env.DB);
        const collection = db.collection(process.env.COLLECTION);

        const monster = await collection.findOne({ MonsterName: monsterName });
        if (!monster) {
            console.log("Monster not found.");
            return null;
        }

    
        const statsAtLevel = {};
        for (const stat in monster.MonsterStats) {
            const base = monster.MonsterStats[stat];
            const growth = monster.GrowthRates[stat];
            statsAtLevel[stat] = base + growth * (level - 1);
        }

        console.log(`Stats for ${monsterName} at level ${level}:`, statsAtLevel);
        return statsAtLevel;
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
    } finally {
        await client.close();
    }
}

getMonsterStatsAtLevel("Dark Magician", 5)



