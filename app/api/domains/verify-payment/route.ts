import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Razorpay from "razorpay"
import crypto from "crypto"

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is authenticated
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = await request.json()

        // Verify payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
        }

        // Get order details from Razorpay
        const order = await razorpay.orders.fetch(razorpay_order_id)

        if (order.status !== "paid") {
            return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
        }

        // Extract domain info from order notes
        const notes = order.notes || {}
        const user_id = notes.user_id as string
        const domain_name = notes.domain_name as string
        const tld = notes.tld as string
        const portfolio_id = notes.portfolio_id as string

        if (user_id !== user.id) {
            return NextResponse.json({ error: "User mismatch" }, { status: 400 })
        }

        // Calculate expiry date (1 year from now)
        const expiryDate = new Date()
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)

        // Create domain record
        const { data: userDomain, error: domainError } = await supabase
            .from("user_domains")
            .insert({
                user_id: user.id,
                domain_name,
                tld,
                portfolio_id,
                expiry_date: expiryDate.toISOString(),
                is_active: true,
                is_verified: false,
                payment_id: razorpay_payment_id,
                amount_paid: Number(order.amount) / 100, // Convert from paisa to rupees
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
                portfolio_id,
                is_active: true,
                ssl_status: "pending",
                dns_configured: false,
            })

        if (mappingError) {
            console.error("Error creating domain mapping:", mappingError)
        }

        return NextResponse.json({
            success: true,
            message: "Domain purchased successfully!",
            domain: userDomain
        })
    } catch (error) {
        console.error("Payment verification error:", error)
        return NextResponse.json(
            { error: "Payment verification failed" },
            { status: 500 }
        )
    }
}