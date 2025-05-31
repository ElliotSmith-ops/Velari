import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
})

export async function POST(req: NextRequest) {
  const { priceId, userId } = await req.json()

  if (!priceId || !userId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL!,
      cancel_url: process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL!,
      metadata: {
        userId,
        priceId     // So we know how many credits to add
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
