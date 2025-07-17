import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { doc, updateDoc, addDoc, collection, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook署名検証失敗:', err.message);
    return NextResponse.json({ error: 'Webhook署名検証失敗' }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const mapId = paymentIntent.metadata.mapId;

    try {
      // 購入記録を作成
      await addDoc(collection(db, 'purchases'), {
        mapId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        stripePaymentIntentId: paymentIntent.id,
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date(),
      });

      // 地図の購入数を増加
      const mapRef = doc(db, 'maps', mapId);
      const mapDoc = await getDoc(mapRef);
      
      if (mapDoc.exists()) {
        const currentData = mapDoc.data();
        await updateDoc(mapRef, {
          purchaseCount: (currentData.purchaseCount || 0) + 1,
        });
      }

      console.log('購入処理完了:', mapId);
    } catch (error) {
      console.error('購入後処理エラー:', error);
    }
  }

  return NextResponse.json({ received: true });
}
