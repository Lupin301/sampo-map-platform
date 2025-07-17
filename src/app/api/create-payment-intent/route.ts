import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { mapId, amount, currency } = await request.json();

    // PaymentIntentを作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency || 'jpy',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        mapId,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('PaymentIntent作成エラー:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
