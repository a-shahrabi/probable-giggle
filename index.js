// index.js
const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// A simple endpoint
app.get('/', (req, res) => {
  res.send('Hello, this is my API!');
});

// Another endpoint to get user data
app.get('/users', (req, res) => {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
  res.json(users);
});

// POST request to create a new user
app.post('/users', (req, res) => {
  const newUser = req.body;
  // In a real app, you’d save the new user to a database here
  res.status(201).json(newUser);
});

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
