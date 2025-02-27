const express = require('express');
const Joi = require('joi');  // For validation
const dotenv = require('dotenv'); // For environment variables
const app = express();
const port = process.env.PORT || 3000;

// Load environment variables from .env file
dotenv.config();

// Middleware to parse JSON requests
app.use(express.json());

// In-memory "database" for storing users
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

// Validation schema for user data
const userSchema = Joi.object({
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
app.get('/users', (req, res) => {
  res.json(users);
});

// GET a single user by ID
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).send('User not found');
  }
  res.json(user);
});

// POST request to create a new user
app.post('/users', (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT request to update an existing user
app.put('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).send('User not found');
  }

  // Validate the incoming request body
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  user.name = req.body.name;
  user.email = req.body.email;
  res.json(user);
});

// DELETE request to remove a user
app.delete('/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) {
    return res.status(404).send('User not found');
  }

  users.splice(userIndex, 1);
  res.status(204).send();  // No content to return
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
