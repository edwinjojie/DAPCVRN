import express from "express";

const router = express.Router();

router.get("/summary", (req, res) => {
  res.json({
    verifiedCredentials: 3,
    activeApplications: 2,
    unreadMessages: 1,
  });
});

export default router;


