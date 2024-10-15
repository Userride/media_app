const mongoose = require('mongoose');
const { Schema } = mongoose;

// User Schema
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensure username is unique
    match: [/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric'] // Alphanumeric validation
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Upload Image Schema
const UploadImageSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  socialMediaUrl: {
    type: String,
    required: false, // Optional if not required
  },
  images: {
    type: [String], // Array of strings to hold image paths
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Creating models
const User = mongoose.model('User', UserSchema);
const UploadImage = mongoose.model('UploadImage', UploadImageSchema);

// Exporting both models
module.exports = { User, UploadImage };
