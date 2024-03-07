import stripe from "#root/config/stripeConfig.js";
import { STRIPE_WEBHOOK_SECRET } from "#root/config/stripeConfig.js";
import { handleSetupIntentSucceed } from "#root/services/payment-method.js";
import {
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
} from "#root/services/subscription.js";

export const handleWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "setup_intent.succeeded":
      const setupIntentSucceeded = event.data.object;
      handleSetupIntentSucceed(setupIntentSucceeded);
      break;

    case "customer.subscription.created":
      const customerSubscriptionCreated = event.data.object;
      // console.log("customerSubscriptionCreated", customerSubscriptionCreated);
      break;

    case "customer.subscription.deleted":
      const customerSubscriptionDeleted = event.data.object;
      handleSubscriptionDeleted(customerSubscriptionDeleted);
      break;

    case "customer.subscription.pending_update_expired":
      const customerSubscriptionPendingUpdateExpired = event.data.object;
      // console.log(
      //   "customerSubscriptionPendingUpdateExpired",
      //   customerSubscriptionPendingUpdateExpired
      // );
      break;

    case "customer.subscription.updated":
      const customerSubscriptionUpdated = event.data.object;
      handleSubscriptionUpdated(customerSubscriptionUpdated);
      break;

    case "invoice.paid":
      const invoicePaid = event.data.object;
      handleInvoicePaid(invoicePaid);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};
