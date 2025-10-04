import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get("stripe-signature")!

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!
            )
        } catch (error) {
            console.error("Webhook signature verification failed:", error)
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
        }

        // Handle the event
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session

            // Get metadata from the session
            const metadata = session.metadata
            if (!metadata || !metadata.user_id || !metadata.domain_name) {
                console.error("Missing metadata in webhook:", metadata)
                return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
            }

            const supabase = await createClient()

            // Calculate expiry date (1 year from now)
            const expiryDate = new Date()
            expiryDate.setFullYear(expiryDate.getFullYear() + 1)

            // Create domain record
            const { data: userDomain, error: domainError } = await supabase
                .from("user_domains")
                .insert({
                    user_id: metadata.user_id,
                    domain_name: metadata.domain_name,
                    tld: metadata.tld,
                    portfolio_id: metadata.portfolio_id,
                    expiry_date: expiryDate.toISOString(),
                    is_active: true,
                    is_verified: false, // Will be verified later
                    payment_id: session.payment_intent as string,
                    amount_paid: Number(metadata.amount),
                })
                .select()
                .single()

            if (domainError) {
                console.error("Error creating domain record:", domainError)
                return NextResponse.json({ error: "Failed to create domain record" }, { status: 500 })
            }

            // Create domain mapping
            const { error: mappingError } = await supabase
                .from("domain_mappings")
                .insert({
                    user_domain_id: userDomain.id,
                    portfolio_id: metadata.portfolio_id,
                    is_active: true,
                    ssl_status: "pending",
                    dns_configured: false,
                })

            if (mappingError) {
                console.error("Error creating domain mapping:", mappingError)
                // Don't fail the webhook, but log the error
            }

            console.log(`Domain ${metadata.domain_name} purchased successfully for user ${metadata.user_id}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        )
    }
}