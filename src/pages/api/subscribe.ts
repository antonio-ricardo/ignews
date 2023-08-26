import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { stripeApi } from "../../services/stripe";

const subscribe = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const session = await getSession({ req });

    if (!session || !session.user || !session.user.email) {
      return;
    }

    const stripeCustomer = await stripeApi.customers.create({
      email: session?.user?.email,
      //metadata
    });

    const stripeCheckoutSession = await stripeApi.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer: stripeCustomer.id,
      line_items: [{ price: "price_1MLobCIwoE4TjqlNHj0gL8Eo", quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_CANCEL_URL as string,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    res.setHeader("Allow", "POST");
    res.status(400).end("Method not allowed");
  }
};

export default subscribe;
