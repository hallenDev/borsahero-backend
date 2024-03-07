import express from "express";
import { handleWebhook } from "#root/controllers/stripe-webhook.js";

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), handleWebhook);

router.use((error, req, res, next) => {
  if (error.error && error.error.details.length > 0) {
    const message = error.error.details[0].message;

    return res.status(400).json({
      msg: message,
    });
  } else {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ msg: error.message });
    } else if (error.code) {
      return res.status(error.code).json({ msg: error.message });
    } else {
      return res
        .status(500)
        .json({ msg: error.message || "Server Internal Error" });
    }
  }
});

export default router;
