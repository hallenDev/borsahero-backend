import express from "express";
import {
  createSetupIntentSecret,
  getPaymentMethod,
} from "#root/controllers/payment-method.js";

const router = express.Router();

router.post("/setup-intent-secret", createSetupIntentSecret);
router.get("/", getPaymentMethod);

export default router;
