const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: String }
});


module.exports = mongoose.model("tokens", tokenSchema);