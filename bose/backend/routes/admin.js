import express from "express";

const router = express.Router();

let orgs = [
  { id: "ORG-101", name: "IIT Delhi", approved: true },
  { id: "ORG-102", name: "MIT Pune", approved: false },
];

router.get("/summary", (req, res) => {
  res.json({
    totalOrgs: orgs.length,
    approvedOrgs: orgs.filter(o => o.approved).length,
    pending: orgs.filter(o => !o.approved).length,
  });
});

router.get("/orgs", (req, res) => res.json(orgs));

router.post("/orgs/:id/approve", (req, res) => {
  orgs = orgs.map(o =>
    o.id === req.params.id ? { ...o, approved: true } : o
  );
  res.json({ success: true });
});

export default router;


