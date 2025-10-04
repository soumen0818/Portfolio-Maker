import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Razorpay from "razorpay"

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

        const { domain_name, tld, portfolio_id, amount } = await request.json()

        // Validate required fields
        if (!domain_name || !tld || !portfolio_id || !amount) {
            return NextResponse.json({
                error: "Missing required fields: domain_name, tld, portfolio_id, amount"
            }, { status: 400 })
        }

        // Validate domain format
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/
        if (!domainRegex.test(domain_name)) {
            return NextResponse.json({
                error: "Invalid domain format"
            }, { status: 400 })
        }

        // Check if domain is already taken
        const { data: existingDomain, error: checkError } = await supabase
            .from("user_domains")
            .select("id")
            .eq("domain_name", domain_name)
            .single()

        if (existingDomain) {
            return NextResponse.json({
                error: "Domain is already taken"
            }, { status: 409 })
        }

        // Verify the portfolio belongs to the user and is published
        const { data: portfolio, error: portfolioError } = await supabase
            .from("portfolios")
            .select("id, is_published")
            .eq("id", portfolio_id)
            .eq("user_id", user.id)
            .single()

        if (portfolioError || !portfolio) {
            return NextResponse.json({
                error: "Portfolio not found or doesn't belong to user"
            }, { status: 404 })
        }

        if (!portfolio.is_published) {
            return NextResponse.json({
                error: "Portfolio must be published before purchasing a domain"
            }, { status: 400 })
        }

        // Get domain pricing
        const { data: domainPricing, error: pricingError } = await supabase
            .from("domains")
            .select("price_usd")
            .eq("tld", tld)
            .single()

        if (pricingError || !domainPricing) {
            return NextResponse.json({
                error: "Invalid domain TLD"
            }, { status: 400 })
        }

        // Verify the amount matches the domain price
        if (Number(amount) !== Number(domainPricing.price_usd)) {
            return NextResponse.json({
                error: "Amount doesn't match domain price"
            }, { status: 400 })
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: Math.round(Number(amount) * 100), // amount in the smallest currency unit
            currency: "USD",
            notes: {
                user_id: user.id,
                domain_name,
                tld,
                portfolio_id,
                amount: amount.toString(),
            },
        })

        return NextResponse.json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
        })
    } catch (error) {
        console.error("Domain purchase error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to initiate domain purchase" },
            { status: 500 }
        )
    }
}