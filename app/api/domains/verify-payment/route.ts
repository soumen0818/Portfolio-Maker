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
            razorpay_signature,
            domain,
            user_id,
            amount,
            coupon_code
        } = await request.json()

        // Extract domain name and TLD from domain parameter
        const domainParts = domain.split('.')
        const domainName = domainParts.slice(0, -1).join('.')
        const tld = domainParts[domainParts.length - 1]

        // Handle free domains (DEV100 coupon)
        const isFreeOrder = razorpay_order_id.startsWith('free_') || amount === 0
        let portfolioId = ''
        let actualAmount = 0

        if (!isFreeOrder) {
            // Verify payment signature for paid orders
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
            const orderUserId = notes.user_id as string
            const orderDomainName = notes.domain_name as string
            const orderTld = notes.tld as string
            portfolioId = notes.portfolio_id as string

            if (orderUserId !== user.id) {
                return NextResponse.json({ error: "User mismatch" }, { status: 400 })
            }

            // Verify domain matches order
            if (orderDomainName !== domainName || orderTld !== tld) {
                return NextResponse.json({ error: "Domain mismatch" }, { status: 400 })
            }

            actualAmount = Number(order.amount) / 100 // Convert from paisa to rupees
        } else {
            // For free domains, use provided data
            if (user_id !== user.id) {
                return NextResponse.json({ error: "User mismatch" }, { status: 400 })
            }

            // For free domains, we need to get portfolio ID from user's published portfolios
            const { data: userPortfolios } = await supabase
                .from("portfolios")
                .select("id")
                .eq("user_id", user.id)
                .eq("is_published", true)
                .limit(1)

            if (!userPortfolios || userPortfolios.length === 0) {
                return NextResponse.json({ error: "No published portfolio found" }, { status: 400 })
            }

            portfolioId = userPortfolios[0].id
            actualAmount = 0
        }

        // Calculate expiry date (1 year from now)
        const expiryDate = new Date()
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)

        // Create domain record
        const domainData: any = {
            user_id: user.id,
            domain_name: domainName,
            tld,
            portfolio_id: portfolioId,
            expiry_date: expiryDate.toISOString(),
            is_active: true,
            is_verified: false,
            payment_id: razorpay_payment_id,
            amount_paid: actualAmount,
        }

        // Only add coupon_code if it exists, to handle missing column gracefully
        if (coupon_code) {
            domainData.coupon_code = coupon_code
        }

        let userDomain: any
        const { data: initialDomain, error: domainError } = await supabase
            .from("user_domains")
            .insert(domainData)
            .select()
            .single()

        if (domainError) {
            console.error("Error creating domain record:", domainError)

            // If error is due to missing coupon_code column, retry without it
            if (domainError.code === 'PGRST204' && domainError.message.includes('coupon_code')) {
                console.log("Retrying domain creation without coupon_code column...")
                const { user_id, domain_name, tld, portfolio_id, expiry_date, is_active, is_verified, payment_id, amount_paid } = domainData

                const { data: retryDomain, error: retryError } = await supabase
                    .from("user_domains")
                    .insert({
                        user_id,
                        domain_name,
                        tld,
                        portfolio_id,
                        expiry_date,
                        is_active,
                        is_verified,
                        payment_id,
                        amount_paid
                    })
                    .select()
                    .single()

                if (retryError) {
                    console.error("Retry failed:", retryError)
                    return NextResponse.json({
                        error: "Failed to create domain record",
                        details: "Database schema needs to be updated. Please add coupon_code column to user_domains table."
                    }, { status: 500 })
                }

                userDomain = retryDomain
            } else {
                return NextResponse.json({
                    error: "Failed to create domain record",
                    details: domainError.message
                }, { status: 500 })
            }
        } else {
            userDomain = initialDomain
        }

        // Create domain mapping
        const { error: mappingError } = await supabase
            .from("domain_mappings")
            .insert({
                user_domain_id: userDomain.id,
                portfolio_id: portfolioId,
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