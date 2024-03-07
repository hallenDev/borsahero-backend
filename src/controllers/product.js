import stripe from "#root/config/stripeConfig.js";
import dataSource from "#root/config/ormConfig.js";
import ProductEntity from "#root/entity/Product.js";
import { PLATFORM, PROFILE } from "#root/entity/Subscription.js";

const productRepo = dataSource.getRepository(ProductEntity);

export const getProducts = async (req, res, next) => {
  try {
    const products = await productRepo.find({
      where: {
        type: PLATFORM,
        is_active: true,
      },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const createProfilePlan = async (req, res, next) => {
  try {
    const { price } = req.body;
    let plan = await productRepo.findOne({
      where: {
        user: {
          id: req.user.id,
        },
      },
    });

    if (plan && plan.is_active) {
      return res
        .status(400)
        .json({ msg: "You already create a profile subscription" });
    }

    if (plan) {
      const stripePrice = await stripe.prices.create({
        currency: "USD",
        unit_amount: Math.round(price * 100),
        recurring: {
          interval: "month",
        },
        product: plan.stripe_product_id,
      });

      await stripe.products.update(plan.stripe_product_id, {
        default_price: stripePrice.id,
        active: true,
      });

      plan.is_active = true;
      plan.price = Math.round(price * 100);
      await productRepo.save(plan);

      res.json(plan);
    } else {
      const stripeProduct = await stripe.products.create({
        name: `Profile Subscription ${req.user.id}`,
        default_price_data: {
          currency: "USD",
          unit_amount: Math.round(price * 100),
          recurring: {
            interval: "month",
          },
        },
      });

      plan = await productRepo.save({
        type: PROFILE,
        stripe_product_id: stripeProduct.id,
        title: "Profile Subscription",
        price: Math.round(price * 100),
        user: req.user,
      });

      res.json(plan);
    }
  } catch (error) {
    next(error);
  }
};

export const getProfilePlan = async (req, res, next) => {
  try {
    const { userId } = req.query || {};

    const plan = await productRepo.findOne({
      where: {
        type: PROFILE,
        is_active: true,
        user: {
          id: userId || req.user.id,
        },
      },
    });

    if (!plan) {
      return res
        .status(404)
        .json({ msg: "You haven't created profile subscription." });
    }

    res.json(plan);
  } catch (error) {
    next(error);
  }
};

export const updateProfilePlan = async (req, res, next) => {
  try {
    const { price } = req.body;

    const plan = await productRepo.findOne({
      where: {
        type: PROFILE,
        user: {
          id: req.user.id,
        },
      },
    });

    if (!plan) {
      return res
        .status(404)
        .json({ msg: "You haven't created profile subscription." });
    }

    const stripePrice = await stripe.prices.create({
      currency: "USD",
      unit_amount: Math.round(price * 100),
      recurring: {
        interval: "month",
      },
      product: plan.stripe_product_id,
    });

    await stripe.products.update(plan.stripe_product_id, {
      default_price: stripePrice.id,
    });

    const prices = await stripe.prices.list({
      product: plan.stripe_product_id,
      active: true,
    });

    for (let i = 0; i < prices.data.length; i++) {
      const priceId = prices.data[i].id;
      if (priceId !== stripePrice.id) {
        await stripe.prices.update(priceId, {
          active: false,
        });
      }
    }

    plan.is_active = true;
    plan.price = Math.round(price * 100);
    await productRepo.save(plan);

    res.json(plan);
  } catch (error) {
    next(error);
  }
};

export const deleteProfilePlan = async (req, res, next) => {
  try {
    let plan = await productRepo.findOne({
      where: {
        type: PROFILE,
        user: {
          id: req.user.id,
        },
      },
    });

    if (!plan) {
      return res
        .status(404)
        .json({ msg: "You haven't created profile subscription." });
    }

    await stripe.products.update(plan.stripe_product_id, {
      active: false,
    });

    const prices = await stripe.prices.list({
      product: plan.stripe_product_id,
      active: true,
    });

    for (let i = 0; i < prices.data.length; i++) {
      const priceId = prices.data[i].id;
      await stripe.prices.update(priceId, {
        active: false,
      });
    }

    plan.is_active = false;
    await productRepo.save(plan);

    res.json({});
  } catch (error) {
    next(error);
  }
};
