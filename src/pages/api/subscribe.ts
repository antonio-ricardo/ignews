import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { stripeApi } from "../../services/stripe";
import { fauna } from "../../services/fauna";
import { query as q } from "faunadb";

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

const subscribe = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const session = await getSession({ req });

    if (!session || !session.user || !session.user.email) {
      return;
    }

    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index("user_by_email"), q.Casefold(session.user.email)))
    );

    let customerId = user.data.stripe_customer_id;

    if (!customerId) {
      const stripeCustomer = await stripeApi.customers.create({
        email: session?.user?.email,
        //metadata
      });

      await fauna.query(
        q.Update(q.Ref(q.Collection("users"), user.ref.id), {
          data: { stripe_customer_id: stripeCustomer.id },
        })
      );

      customerId = stripeCustomer.id;
    }

    const stripeCheckoutSession = await stripeApi.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer: customerId,
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
