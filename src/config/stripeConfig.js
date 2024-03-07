import stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
export const STRIPE_PAYOUT_RETURN_URL = process.env.STRIPE_PAYOUT_RETURN_URL;

export default stripe(process.env.STRIPE_SECRET_KEY);
