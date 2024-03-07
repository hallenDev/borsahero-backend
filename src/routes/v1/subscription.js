import express from "express";
import {
  getSubscription,
  subscribeToPlan,
  cancelSubscription,
  updatePlan,
  subscribeToProfile,
  getSubscriptionsForOtherUser,
  getMyProfileSubscribers,
} from "#root/controllers/subscription.js";

const router = express.Router();

router.get("/", getSubscription);
router.post("/", subscribeToPlan);
router.post("/update", updatePlan);
router.post("/cancel", cancelSubscription);
router.post("/profile/subscribe", subscribeToProfile);
router.get("/profile/subscriptions", getSubscriptionsForOtherUser);
router.get("/profile/subscribers", getMyProfileSubscribers);

export default router;
