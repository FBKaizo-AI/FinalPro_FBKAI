//CRUD ops for backend management with MongoDB
const mongoose = require('mongoose');
const express = require('express');

const app = express();
app.use(express.json());
mongoose.connect('mongodb:')