import express from "express";
import {
  getProducts,
  getProfilePlan,
  createProfilePlan,
  updateProfilePlan,
  deleteProfilePlan,
} from "#root/controllers/product.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/profile", getProfilePlan);
router.post("/profile", createProfilePlan);
router.put("/profile", updateProfilePlan);
router.delete("/profile", deleteProfilePlan);

export default router;
