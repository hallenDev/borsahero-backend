import express from "express";
import {
  createAccountLink,
  getPayoutDetails,
} from "#root/controllers/payout.js";

const router = express.Router();

router.get("/", getPayoutDetails);
router.get("/account-link", createAccountLink);

export default router;
