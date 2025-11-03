import express from "express";

const router = express.Router();

let profile = {
  id: "C-001",
  name: "Ananya Singh",
  email: "ananya@dapcvrn.com",
  skills: ["React", "Node.js", "MongoDB"],
  resumeURL: "/uploads/resume.pdf",
  visibility: true,
};

router.get("/", (req, res) => res.json(profile));

router.post("/", (req, res) => {
  profile = { ...profile, ...req.body };
  res.json(profile);
});

export default router;


