import stripe from "#root/config/stripeConfig.js";

export const handleSetupIntentSucceed = async (setupIntent) => {
  const { customer: customerId, payment_method: paymentMethodId } = setupIntent;

  const customer = await stripe.customers.retrieve(customerId);
  if (!customer || customer.deleted) {
    console.log(customer, "deleted customer");
    return;
  }

  try {
    const { data: paymentMethods = [] } =
      await stripe.customers.listPaymentMethods(customerId, {
        limit: 100,
      });

    console.log("paymentMethods", paymentMethods);
    for (let i = 0; i < paymentMethods.length; i++) {
      if (paymentMethods[i].id === paymentMethodId) continue;
      await stripe.paymentMethods.detach(paymentMethods[i].id);
    }

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
