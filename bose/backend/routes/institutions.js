import express from "express";

const router = express.Router();

let credentials = [
  {
    id: "CR-1001",
    student: "Ravi Menon",
    course: "B.Tech CSE",
    year: 2024,
    status: "issued",
  },
];

router.get("/issued", (req, res) => res.json(credentials));

router.post("/issue", (req, res) => {
  const { student, course, year } = req.body;
  const newCred = {
    id: `CR-${Date.now()}`,
    student,
    course,
    year,
    status: "issued",
  };
  credentials.push(newCred);
  res.json(newCred);
});

export default router;


