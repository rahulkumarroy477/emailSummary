// ../models/Email.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const emailSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: String,
  from: String,
  date: String,
  body: String,
});

const Email = mongoose.model('Email', emailSchema);
module.exports = Email;
