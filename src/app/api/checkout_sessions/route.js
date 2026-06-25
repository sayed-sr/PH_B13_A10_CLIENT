import { NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) { 
  try {
    const body = await request.json();
    
    const { bookingId, ticketTitle, price, quantity, ticketId } = body;

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: ticketTitle,
            },
            unit_amount: Math.round(parseFloat(price) * 100), 
          },
          quantity: parseInt(quantity) || 1,
        },
      ],
      mode: "payment",
      
     
      success_url: `${origin}/dashboard/user?payment_success=true&bookingId=${bookingId}&ticketId=${ticketId}&qty=${quantity}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/user`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}