import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { email } = await request.json()

  try {
    const data = await resend.emails.send({
      from: 'Occulta <onboarding@resend.dev>',
      to: email,
      subject: "You're in. Welcome to Occulta.",
      html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f0f0f; color: #ffffff; padding: 32px; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
        <div style="text-align: left; margin-bottom: 24px;">
        <img
            src="https://occulta.ai/occulta-logo.png"
            alt="Occulta Logo"
            width="160"
            height="auto"
            style="display: block; max-width: 160px;"
        />
        </div>

        </div>
        <h2 style="font-size: 24px; color: #c084fc; margin-bottom: 12px;">You're in. Welcome to Occulta 🚨</h2>
        <p style="font-size: 16px; color: #cccccc; line-height: 1.6;">
          You’re now subscribed to <strong style="color: #ffffff;">Occulta</strong>, your personal radar for high-signal startup trends and emerging product demand.
        </p>
        <p style="font-size: 16px; color: #cccccc; margin-top: 16px; line-height: 1.6;">
          You’ll get a daily drop of 3–5 top insights. No fluff. Just actionable signals from the digital underground.
        </p>
        <p style="font-size: 14px; color: #666666; margin-top: 32px; border-top: 1px solid #333333; padding-top: 16px;">
            Don’t want to receive future emails? <a href="https://occulta.ai/unsubscribe" style="color: #c084fc; text-decoration: underline;">Unsubscribe here</a>.
        </p>
      </div>
    `,
    
    })

    return Response.json({ status: 'sent', data })
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
