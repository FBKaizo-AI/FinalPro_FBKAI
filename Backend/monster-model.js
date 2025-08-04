require('dotenv').config();
const mongoose = require('mongoose');

const monsterSchema = new mongoose.Schema({
    "Monster Name": String,
    "Class": String,
    "HP": Number,
    "ATK": Number,
    "DEF": Number,
    "AP": Number,
    "GT": Number,
    "Luck": Number,
    "Speed": Number,
    "Attack Effect Unlock (Level)": Number,
    "Attack Effect": String,
    "Special Unlock (Level)": Number,
    "Special Name": String,
    "Special Effect": String,
    "Ability 1 Unlock (Level)": Number,
    "Ability 1": String,
    "Ability 2 Unlock (Level)": Number,
    "Ability 2": String,
    "Ability 3 Unlock (Level)": Number,
    "Ability 3": String
}, { collection: process.env.COLLECTION });

module.exports = mongoose.model('Monster', monsterSchema);
