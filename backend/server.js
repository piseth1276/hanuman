const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
async function testDbConnection() {
  try {
    await db.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
testDbConnection();

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Student Management System API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 