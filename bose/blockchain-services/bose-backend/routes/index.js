// routes/index.js
const express = require('express');
const router = express.Router();

const certificateRoutes = require('./certificate-routes');
const skillRoutes = require('./skill-routes');
const adminRoutes = require('./admin-routes');

router.use('/certificate', certificateRoutes);
router.use('/skill', skillRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
