import express from 'express';
import { Rating } from '../models/index.js';

const router = express.Router();

// Create a new rating
router.post('/', async (req, res) => {
  try {
    const { employeeId, tenureMonths, performance, remarks, raterId } = req.body;

    // Validate required fields
    if (!employeeId || !raterId || !tenureMonths || !performance) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const rating = await Rating.create({
      employeeId,
      raterId,
      tenureMonths,
      performance,
      remarks
    });

    res.status(201).json(rating);
  } catch (error) {
    console.error('Error creating rating:', error);
    res.status(500).json({ error: 'Failed to create rating' });
  }
});

// Get ratings for a specific employee/candidate
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const ratings = await Rating.find({ employeeId: req.params.employeeId })
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

export default router;
