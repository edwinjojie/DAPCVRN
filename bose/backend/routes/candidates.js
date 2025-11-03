import express from 'express';

const router = express.Router();

let candidates = [
  {
    id: 'C-001',
    name: 'Ananya Singh',
    skills: ['React', 'Node.js', 'MongoDB'],
    experience: 3,
    location: 'Bangalore',
    verified: true,
    rating: 4.5,
  },
  {
    id: 'C-002',
    name: 'Rohit Patel',
    skills: ['Python', 'Django', 'PostgreSQL'],
    experience: 5,
    location: 'Pune',
    verified: false,
    rating: 3.9,
  },
];

router.get('/search', (req, res) => {
  const { keyword = '', location = '', verified } = req.query || {};
  let filtered = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(String(keyword).toLowerCase()) &&
      c.location.toLowerCase().includes(String(location).toLowerCase())
  );
  if (verified !== undefined) {
    filtered = filtered.filter((c) => c.verified === (String(verified) === 'true'));
  }
  res.json(filtered);
});

router.get('/:id/credentials', (req, res) => {
  res.json({
    candidateId: req.params.id,
    credentials: [
      {
        credentialId: 'CR-101',
        type: 'Bachelor of Technology',
        issuer: 'IIT Delhi',
        status: 'verified',
        issuedAt: '2021-07-15',
      },
      {
        credentialId: 'CR-102',
        type: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        status: 'pending',
        issuedAt: '2024-03-22',
      },
    ],
  });
});

export default router;


