import express from "express";

const router = express.Router();

let applications = [
  { _id: "a1", jobId: "j1", title: "Blockchain Developer", status: "applied" },
  { _id: "a2", jobId: "j2", title: "Smart Contract Engineer", status: "reviewed" },
];

router.get("/my", (req, res) => res.json(applications));

router.post("/apply/:jobId", (req, res) => {
  const newApp = { _id: `a${applications.length+1}`, jobId: req.params.jobId, title: req.body.title, status: "applied" };
  applications.push(newApp);
  res.json(newApp);
});

export default router;


