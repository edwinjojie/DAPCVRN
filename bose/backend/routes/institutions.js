import express from "express";
import { User } from '../models/index.js';

const router = express.Router();

// Get all active universities/institutions for dropdown
router.get('/', async (req, res) => {
  try {
    const universities = await User.find({
      role: 'university',
      isActive: true
    })
    .select('name email organization')
    .sort({ organization: 1 })
    .lean();

    // Return array of institutions with their details
    const institutions = universities.map(uni => ({
      id: uni._id.toString(),
      name: uni.organization,
      contactName: uni.name,
      contactEmail: uni.email
    }));

    res.json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ error: 'Failed to fetch institutions' });
  }
});

export default router;


