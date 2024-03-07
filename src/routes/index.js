import * as express from "express";

import authRouter from "#root/routes/v1/auth.js";
import userRouter from "#root/routes/v1/user.js";
import contentRouter from "#root/routes/v1/content.js";
import discoveryRouter from "#root/routes/v1/discovery.js";
import paymentMethodRouter from "#root/routes/v1/payment-method.js";
import payoutRouter from "#root/routes/v1/payout.js";
import reviewRouter from "#root/routes/v1/review.js";
import subscriptionRouter from "#root/routes/v1/subscription.js";
import streamRouter from "#root/routes/v1/stream.js";
import productRouter from "#root/routes/v1/product.js";
import validateToken from "#root/middlewares/validateToken.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", validateToken(), userRouter);
router.use("/content", validateToken(), contentRouter);
router.use("/discovery", validateToken(), discoveryRouter);
router.use("/payment-method", validateToken(), paymentMethodRouter);
router.use("/payout", validateToken(), payoutRouter);
router.use("/review", validateToken(), reviewRouter);
router.use("/subscription", validateToken(), subscriptionRouter);
router.use("/stream", validateToken(), streamRouter);
router.use("/product", validateToken(), productRouter);

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
