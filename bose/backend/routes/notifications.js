import express from 'express';

const router = express.Router();

let notifications = [
  { id: 'N1', message: 'New applicant for Job #1001', time: '09:40', read: false },
  { id: 'N2', message: 'Credential verified for Rohit Patel', time: '10:15', read: false },
];

router.get('/', (req, res) => res.json(notifications));

router.post('/:id/read', (req, res) => {
  notifications = notifications.map((n) => (n.id === req.params.id ? { ...n, read: true } : n));
  res.json({ success: true });
});

export default router;


