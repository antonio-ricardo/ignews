import { Stripe } from "stripe";

export const stripeApi = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
  appInfo: {
    name: "igNews",
    version: '1',
  },
});
