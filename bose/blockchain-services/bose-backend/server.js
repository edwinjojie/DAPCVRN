'use strict';
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const routes = require('./routes');
const path = require('path');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Mount all blockchain APIs
app.use('/api', routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Blockchain Service running on port ${PORT}`);
});
