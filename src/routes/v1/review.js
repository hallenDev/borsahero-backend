import express from "express";
import {
  getReviews,
  addReview,
  deleteReview,
} from "#root/controllers/review.js";

const router = express.Router();

router.get("/", getReviews);
router.post("/", addReview);
router.delete("/:id", deleteReview);

export default router;
