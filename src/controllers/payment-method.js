import stripe from "#root/config/stripeConfig.js";
import dataSource from "#root/config/ormConfig.js";
import UserEntity from "#root/entity/User.js";

const userRepo = dataSource.getRepository(UserEntity);

export const createSetupIntentSecret = async (req, res, next) => {
  try {
    if (!req.user.stripe_customer_id) {
      const customer = await stripe.customers.create({
        name: `${req.user.first_name} ${req.user.last_name}`,
        email: req.user.email,
        metadata: {
          merchant_id: req.user.id,
        },
      });
      req.user.stripe_customer_id = customer.id;
      await userRepo.save(req.user);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: req.user.stripe_customer_id,
    });

    res.json({
      setupIntent: setupIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentMethod = async (req, res, next) => {
  try {
    const customerId = req.user.stripe_customer_id;
    if (!customerId) {
      res.status(400).send({ msg: "No payment method attached." });
      return;
    }

    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      res.status(400).send({ msg: "No payment method attached." });
      return;
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(
      customer.invoice_settings.default_payment_method
    );

    const { billing_details, card } = paymentMethod;

    res.json({
      name: billing_details.name,
      brand: card.brand,
      last4: card.last4,
    });
  } catch (error) {
    next(error);
  }
};
