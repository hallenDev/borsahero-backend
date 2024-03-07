import stripe from "#root/config/stripeConfig.js";
import dataSource from "#root/config/ormConfig.js";
import SubscriptionEntity from "#root/entity/Subscription.js";

const subscriptionRepo = dataSource.getRepository(SubscriptionEntity);

const handleIncompleteExpired = async (stripeSubscription) => {
  const subscription_id = stripeSubscription.id;
  await subscriptionRepo.delete({ subscription_id });

  // send push notification to the website and mobile app
};

const handleActiveSubscription = async (stripeSubscription) => {
  const subscription_id = stripeSubscription.id;
  const subscription = await subscriptionRepo.findOne({
    where: { subscription_id },
  });

  if (subscription) {
    subscription.status = stripeSubscription.status;
    subscription.ended_at = stripeSubscription.current_period_end;
    subscription.price =
      stripeSubscription?.items?.data?.[0]?.price?.unit_amount || 0;
    await subscriptionRepo.save(subscription);

    // send push notification to the website and mobile app
  }
};

export const handleSubscriptionUpdated = async (stripeSubscription) => {
  try {
    const { status } = stripeSubscription;
    if (status === "incomplete_expired") {
      await handleIncompleteExpired(stripeSubscription);
    } else if (status === "active") {
      await handleActiveSubscription(stripeSubscription);
    }
  } catch (error) {
    console.log(error);
  }
};

export const handleSubscriptionDeleted = async (stripeSubscription) => {
  try {
    const subscription_id = stripeSubscription.id;
    await subscriptionRepo.delete({ subscription_id });

    // send push notification to the website and mobile app
  } catch (error) {
    console.log(error);
  }
};

export const handleInvoicePaid = async (invoice) => {
  try {
    // const subscription = await subscriptionRepo.findOne({
    //   where: {
    //     subscription_id: invoice.subscription,
    //   },
    //   relations: {
    //     profileUser: true,
    //   },
    // });
    // if (subscription && subscription.profileUser) {
    //   console.log(invoice.amount_paid, invoice.currency);
    //   const transfer = await stripe.transfers.create({
    //     amount: invoice.amount_paid,
    //     currency: invoice.currency,
    //     destination: subscription.profileUser.stripe_account_id,
    //   });
    //   console.log(JSON.stringify(transfer));
    // }
  } catch (error) {
    console.log(error);
  }
};
