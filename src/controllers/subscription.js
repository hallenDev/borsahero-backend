import stripe from "#root/config/stripeConfig.js";
import dataSource from "#root/config/ormConfig.js";
import UserEntity from "#root/entity/User.js";
import ProductEntity from "#root/entity/Product.js";
import SubscriptionEntity from "#root/entity/Subscription.js";
import { PLATFORM, PROFILE } from "#root/entity/Subscription.js";

const userRepo = dataSource.getRepository(UserEntity);
const productRepo = dataSource.getRepository(ProductEntity);
const subscriptionRepo = dataSource.getRepository(SubscriptionEntity);

export const getSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionRepo.findOne({
      where: {
        type: PLATFORM,
        user: {
          id: req.user.id,
        },
      },
      select: {
        id: true,
        status: true,
        type: true,
        ended_at: true,
        is_cancelled: true,
        subscription_id: true,
      },
      relations: {
        product: true,
      },
    });

    const products = await productRepo.find({
      where: {
        type: PLATFORM,
        is_active: true,
      },
    });
    res.json({ subscription, products });
  } catch (error) {
    next(error);
  }
};

export const subscribeToPlan = async (req, res, next) => {
  try {
    const customerId = req.user.stripe_customer_id;
    if (!customerId) {
      return res.status(400).send({ msg: "No payment method attached." });
    }

    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      return res.status(400).send({ msg: "No payment method attached." });
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(
      customer.invoice_settings.default_payment_method
    );

    if (!paymentMethod) {
      return res.status(400).send({ msg: "No payment method attached." });
    }

    let subscription = await subscriptionRepo.findOne({
      where: {
        type: PLATFORM,
        user: {
          id: req.user.id,
        },
      },
    });

    if (subscription) {
      return res.status(400).json({ msg: "You already have a subscription." });
    }

    const { product_id } = req.body;
    const product = await productRepo.findOneById(product_id);
    if (!product) {
      return res.status(400).json({ msg: "Product does not exist." });
    }

    const stripeProduct = await stripe.products.retrieve(
      product.stripe_product_id
    );

    const { data: prices } = await stripe.prices.list({
      product: stripeProduct.id,
      limit: 1,
    });

    const price = prices?.[0];
    if (!price) {
      return res.status(400).json({ msg: "Product does not exist." });
    }

    const stripeSubscription = await stripe.subscriptions.create({
      customer: req.user.stripe_customer_id,
      items: [
        {
          price: price.id,
        },
      ],
    });

    const { id, current_period_end, status, items } = stripeSubscription;

    await subscriptionRepo.save({
      subscription_id: id,
      status: status,
      type: PLATFORM,
      ended_at: current_period_end,
      user: req.user,
      product: product,
      price: items?.data?.[0]?.price?.unit_amount || 0,
    });

    subscription = await subscriptionRepo.findOne({
      where: {
        type: PLATFORM,
        user: {
          id: req.user.id,
        },
      },
      select: {
        id: true,
        status: true,
        type: true,
        ended_at: true,
        is_cancelled: true,
      },
      relations: {
        product: true,
      },
    });

    res.json(subscription);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionRepo.findOne({
      where: {
        type: PLATFORM,
        user: {
          id: req.user.id,
        },
      },
    });

    if (!subscription) {
      return res.status(400).json({ msg: "Subscription does not exist." });
    }

    await stripe.subscriptions.update(subscription.subscription_id, {
      cancel_at_period_end: true,
    });

    subscription.is_cancelled = true;
    await subscriptionRepo.save(subscription);

    res.json({
      is_cancelled: true,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    const subscription = await subscriptionRepo.findOne({
      where: {
        type: PLATFORM,
        user: {
          id: req.user.id,
        },
      },
    });

    if (!subscription) {
      return res.status(400).json({ msg: "Subscription does not exist." });
    }

    const product = await productRepo.findOneById(product_id);
    if (!product) {
      return res.status(400).json({ msg: "Product does not exist." });
    }

    const stripeProduct = await stripe.products.retrieve(
      product.stripe_product_id
    );

    const { data: prices } = await stripe.prices.list({
      product: stripeProduct.id,
      limit: 1,
    });

    const price = prices?.[0];
    if (!price) {
      return res.status(400).json({ msg: "Product does not exist." });
    }

    let stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.subscription_id
    );

    stripeSubscription = await stripe.subscriptions.update(
      subscription.subscription_id,
      {
        cancel_at_period_end: false,
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: price.id,
          },
        ],
      }
    );

    const { current_period_end, status, items } = stripeSubscription;
    subscription.ended_at = current_period_end;
    subscription.status = status;
    subscription.is_cancelled = false;
    subscription.product = product;
    subscription.price = items?.data?.[0]?.price?.unit_amount || 0;
    await subscriptionRepo.save(subscription);

    res.json(subscription);

    res.json({});
  } catch (error) {
    next(error);
  }
};

export const subscribeToProfile = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    const customerId = req.user.stripe_customer_id;
    if (!customerId) {
      return res.status(400).send({ msg: "No payment method attached." });
    }

    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      return res.status(400).send({ msg: "No payment method attached." });
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(
      customer.invoice_settings.default_payment_method
    );

    if (!paymentMethod) {
      return res.status(400).send({ msg: "No payment method attached." });
    }

    const otherUser = await userRepo.findOneById(user_id);
    if (!otherUser) {
      return res.status(400).json({ msg: "User does not exist." });
    }

    const plan = await productRepo.findOne({
      is_active: true,
      where: {
        user: {
          id: user_id,
        },
      },
    });

    if (!plan) {
      return res
        .status(400)
        .json({ msg: "This user haven't created the profile subscription." });
    }

    const stripeProduct = await stripe.products.retrieve(
      plan.stripe_product_id
    );

    if (!stripeProduct || !stripeProduct?.active) {
      return res
        .status(400)
        .json({ msg: "This user haven't created the profile subscription." });
    }

    const prices = await stripe.prices.list({
      product: plan.stripe_product_id,
      active: true,
    });

    if (!prices?.data?.length) {
      return res
        .status(400)
        .json({ msg: "This user haven't created the profile subscription." });
    }

    let subscription = await subscriptionRepo.findOne({
      where: {
        type: PROFILE,
        user: {
          id: req.user.id,
        },
        profileUser: {
          id: user_id,
        },
      },
    });

    if (subscription) {
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.subscription_id,
        {
          cancel_at_period_end: false,
          items: [
            {
              id: stripeSubscription.items.data[0].id,
              price: prices.data[0].id,
            },
          ],
        }
      );

      const { current_period_end, status, items } = stripeSubscription;
      subscription.ended_at = current_period_end;
      subscription.status = status;
      subscription.is_cancelled = false;
      subscription.profileUser = otherUser;
      subscription.price = items?.data?.[0]?.price?.unit_amount || 0;
      await subscriptionRepo.save(subscription);
    } else {
      const stripeSubscription = await stripe.subscriptions.create({
        customer: req.user.stripe_customer_id,
        items: [
          {
            price: prices.data[0].id,
          },
        ],
        transfer_data: {
          destination: otherUser.stripe_account_id,
          amount_percent: 85,
        },
        on_behalf_of: otherUser.stripe_account_id,
      });

      const { id, current_period_end, status, items } = stripeSubscription;

      await subscriptionRepo.save({
        subscription_id: id,
        status: status,
        type: PROFILE,
        ended_at: current_period_end,
        user: req.user,
        profileUser: otherUser,
        product: plan,
        price: items?.data?.[0]?.price?.unit_amount || 0,
      });
    }

    subscription = await subscriptionRepo.findOne({
      where: {
        type: PROFILE,
        user: {
          id: req.user.id,
        },
        profileUser: {
          id: otherUser.id,
        },
      },
      select: {
        id: true,
        status: true,
        type: true,
        ended_at: true,
        is_cancelled: true,
      },
    });

    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionsForOtherUser = async (req, res, next) => {
  try {
    const subscriptions = await subscriptionRepo.find({
      where: {
        type: PROFILE,
        user: {
          id: req.user.id,
        },
        status: "active",
      },
      relations: {
        profileUser: true,
      },
    });

    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

export const getMyProfileSubscribers = async (req, res, next) => {
  try {
    let totalBalance = { amount: 0, currency: "USD" };
    if (req.user.stripe_account_id) {
      const balance = await stripe.balance.retrieve({
        stripeAccount: req.user.stripe_account_id,
      });
      totalBalance.amount =
        (balance.available?.[0].amount || 0) +
        (balance.pending?.[0].amount || 0);
      totalBalance.currency = balance.available?.[0]?.currency?.toUpperCase();
    }

    const subscriptions = await subscriptionRepo.find({
      where: {
        type: PROFILE,
        profileUser: {
          id: req.user.id,
        },
      },
      relations: {
        user: true,
      },
    });

    res.json({ subscriptions, balance: totalBalance });
  } catch (error) {
    next(error);
  }
};
