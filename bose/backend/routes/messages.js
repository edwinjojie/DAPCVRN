import express from 'express';

const router = express.Router();

let conversations = {
  'C-001': [
    { sender: 'recruiter', text: 'Hi Ananya, we liked your profile!', time: '10:02' },
    { sender: 'C-001', text: 'Thank you!', time: '10:04' },
  ],
};

router.get('/:candidateId', (req, res) => {
  res.json(conversations[req.params.candidateId] || []);
});

router.post('/:candidateId', (req, res) => {
  const msg = { sender: 'recruiter', text: req.body?.text || '', time: new Date().toLocaleTimeString() };
  conversations[req.params.candidateId] = [
    ...(conversations[req.params.candidateId] || []),
    msg,
  ];
  res.json(msg);
});

export default router;


