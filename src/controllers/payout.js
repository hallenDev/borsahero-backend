import stripe from "#root/config/stripeConfig.js";
import dataSource from "#root/config/ormConfig.js";
import UserEntity from "#root/entity/User.js";

const userRepo = dataSource.getRepository(UserEntity);

export const createAccountLink = async (req, res, next) => {
  try {
    const os = req.headers["x-os"];

    if (!req.user.stripe_account_id) {
      const account = await stripe.accounts.create({
        type: "express",
        email: req.user.email,
      });

      req.user.stripe_account_id = account.id;
      await userRepo.save(req.user);
    }

    const accountLink = await stripe.accountLinks.create({
      account: req.user.stripe_account_id,
      refresh_url: "https://example.com/reauth",
      return_url:
        os === "ios" || os === "android"
          ? "https://borsahero.onelink.me/VWNa/mqfwgeah?af_force_deeplink=true"
          : "https://dev.borsahero.com/setting/payment",

      type: "account_onboarding",
    });

    res.json(accountLink);
  } catch (error) {
    next(error);
  }
};

export const getPayoutDetails = async (req, res, next) => {
  try {
    if (!req.user.stripe_account_id) {
      res.json({
        details_submitted: false,
        payouts_enabled: false,
      });
      return;
    }

    const account = await stripe.accounts.retrieve(req.user.stripe_account_id);

    const { details_submitted, payouts_enabled } = account;
    const { bank_name, country, currency, last4, routing_number } =
      account?.external_accounts?.data?.[0] || {};

    res.json({
      details_submitted,
      payouts_enabled,
      bank_name,
      country,
      currency,
      last4,
      routing_number,
    });
  } catch (error) {
    next(error);
  }
};
