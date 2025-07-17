import { loadStripe } from '@stripe/stripe-js';

// クライアントサイド用
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// 価格フォーマット
export const formatPrice = (amount: number, currency = 'JPY') => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Stripe料金計算（手数料込み）
export const calculateStripeAmount = (price: number) => {
  // Stripe手数料: 3.6% + 決済手数料
  const stripeFee = Math.ceil(price * 0.036);
  const fixedFee = 0; // 固定手数料（必要に応じて）
  return price + stripeFee + fixedFee;
};
