import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error('❌ Webhook signature error:', err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = session.metadata?.userId
      const priceId = session.metadata?.priceId

      console.log('💳 Webhook received for userId:', userId, 'priceId:', priceId)

      const creditMap: Record<string, number> = {
        [process.env.STRIPE_PRICE_ID_10!]: 10,
        [process.env.STRIPE_PRICE_ID_50!]: 50,
        [process.env.STRIPE_PRICE_ID_Unlimited!]: 9999,
      }

      const creditsToAdd = creditMap[priceId!] || 0

      if (userId && creditsToAdd > 0) {
        // Step 1: Get current credits
        const { data: user, error: fetchError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', userId)
          .single()

        if (fetchError || !user) {
          console.error('❌ Failed to fetch user credits:', fetchError)
          return new NextResponse('User fetch error', { status: 500 })
        }

        const newCredits = (user.credits || 0) + creditsToAdd

        // Step 2: Update user credits
        const { error: updateError } = await supabase
          .from('users')
          .update({ credits: newCredits })
          .eq('id', userId)

        if (updateError) {
          console.error('❌ Supabase update error:', updateError)
          return new NextResponse('Error updating credits', { status: 500 })
        }

        console.log(`✅ Added ${creditsToAdd} credits to user ${userId} (new total: ${newCredits})`)
      } else {
        console.warn('⚠️ Missing userId or priceId in webhook')
      }
    }
  } catch (err: any) {
    console.error('❌ Webhook handler error:', err)
    return new NextResponse('Webhook handler failed', { status: 500 })
  }

  return new NextResponse('ok', { status: 200 })
}
