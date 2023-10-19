const mongoose = require('mongoose');
require('dotenv').config()
console.log(process.env)
console.log(process.env.MONGODB_URI) // remove this after you've confirmed it is working

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks');

module.exports = mongoose.connection;
