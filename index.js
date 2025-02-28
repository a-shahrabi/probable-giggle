const express = require('express');
const Joi = require('joi');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const winston = require('winston');
const app = express();
const port = process.env.PORT || 3000;

// Load environment variables from .env file
dotenv.config();

// Set up winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logfile.log' })
  ]
});

// Middleware to log every request
app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Middleware to parse JSON requests
app.use(express.json());

// Define a user schema with mongoose
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});

// Create a User model based on the schema
const User = mongoose.model('User', userSchema);

// Validation schema for user data
const userValidationSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required()
});

// Middleware to log requests
app.use((req, res, next) => {
  logger.info(`${req.method} request to ${req.url}`);
  next();
});

// Versioned API route (future-proofing)
app.use('/api/v1', require('./routes/v1'));  // New routes folder (v1) for API versioning

// A simple endpoint
app.get('/', (req, res) => {
  res.send('Hello, this is my sophisticated API!');
});

// Error handling middleware (catch all)
app.use((err, req, res, next) => {
  logger.error(err.stack);
  if (err.name === 'ValidationError') {
    return res.status(400).send('Invalid input data');
  }
  res.status(500).send('Something went wrong!');
});

// Listen on port
app.listen(port, () => {
  logger.info(`API is running on http://localhost:${port}`);
});
