require('dotenv').config();
const mongoose = require('mongoose');
const Monster = require('./monster-model'); //imports the monster model i defined from DB
const express = require('express');
const MONGO_URI = process.env.MARKELL_MONGO;

// MongoDB connection and model def
async function getMonsterStatsAtLevel(monsterName, level) {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");

        const monster = await Monster.findOne({ "Monster Name": monsterName });

        if (!monster) {
            console.log("Monster not found.");
            return null;
        }

        const GT = monster.GT;  // Growth Rate per level

        // Calculate scaled stats (base + GT * (level - 1))
        const statsAtLevel = {
            HP: monster.HP + GT * (level - 1),
            ATK: monster.ATK + GT * (level - 1),
            DEF: monster.DEF + GT * (level - 1),
            AP: monster.AP,  // Assuming AP, Luck, and Speed doesn't scale
            Luck: monster.Luck,
            Speed: monster.Speed
        };

        // Determine unlocked abilities based on the level and puts them in an array
        const unlockedAbilities = [];

        if (level >= monster["Ability 1 Unlock (Level)"]) unlockedAbilities.push(monster["Ability 1"]);
        if (level >= monster["Ability 2 Unlock (Level)"]) unlockedAbilities.push(monster["Ability 2"]);
        if (level >= monster["Ability 3 Unlock (Level)"]) unlockedAbilities.push(monster["Ability 3"]);

        // Attack Effect unlock check
        const attackEffect = level >= monster["Attack Effect Unlock (Level)"]
            ? monster["Attack Effect"]
            : "Locked";

        // Special Effect unlock check
        const specialEffect = level >= monster["Special Unlock (Level)"] && monster["Special Unlock (Level)"] !== -1
            ? `${monster["Special Name"]}: ${monster["Special Effect"]}`
            : "Locked";
        // returns the result in the structure of the monster model
        const result = {
            MonsterName: monster["Monster Name"],
            Class: monster.Class,
            Stats: statsAtLevel,
            UnlockedAbilities: unlockedAbilities,
            AttackEffect: attackEffect,
            SpecialEffect: specialEffect
        };

        console.log(result);
        return result;

    } catch (error) {
        console.error("Error fetching monster data:", error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
    }
}

// Test Call 
//getMonsterStatsAtLevel("Alpha The Magnet Warrior", 25);

module.exports = { getMonsterStatsAtLevel };
