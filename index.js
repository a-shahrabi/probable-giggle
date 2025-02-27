const express = require('express');
const Joi = require('joi');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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
  console.log(`${req.method} request to ${req.url}`);
  next();
});

// A simple endpoint
app.get('/', (req, res) => {
  res.send('Hello, this is my sophisticated API!');
});

// GET all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send('Error retrieving users');
  }
});

// GET a single user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (err) {
    res.status(500).send('Error retrieving the user');
  }
});

// POST request to create a new user
app.post('/users', async (req, res) => {
  const { error } = userValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const newUser = new User({
    name: req.body.name,
    email: req.body.email
  });

  try {
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).send('Error saving the user');
  }
});

// PUT request to update an existing user
app.put('/users/:id', async (req, res) => {
  const { error } = userValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (err) {
    res.status(500).send('Error updating the user');
  }
});

// DELETE request to remove a user
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(204).send();  // No content to return
  } catch (err) {
    res.status(500).send('Error deleting the user');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).send('Invalid input data');
  }
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
