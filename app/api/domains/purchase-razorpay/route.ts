import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Razorpay from "razorpay"

// Initialize Razorpay
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

        const { domain_name, tld, portfolio_id, amount, coupon_code } = await request.json()

        // Validate required fields
        if (!domain_name || !tld || !portfolio_id || amount === undefined) {
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

        // Get domain pricing in INR
        const { data: domainPricing, error: pricingError } = await supabase
            .from("domains")
            .select("price_inr, price_usd")
            .eq("tld", tld)
            .single()

        if (pricingError || !domainPricing) {
            return NextResponse.json({
                error: "Invalid domain TLD"
            }, { status: 400 })
        }

        // Use INR price first, fallback to USD
        const domainPrice = domainPricing.price_inr || domainPricing.price_usd

        // Validate coupon if provided and calculate expected amount
        let expectedAmount = domainPrice
        if (coupon_code) {
            const validCoupons: { [key: string]: number } = {
                "NEWUSER": 10,     // 10% off for new users
                "SAVE20": 20,      // 20% off 
                "FIRST50": 50,     // 50% off first purchase
                "WELCOME25": 25,   // 25% welcome discount
                "STUDENT30": 30,   // 30% student discount
                "EARLY40": 40,     // 40% early bird
                "FRIEND15": 15,    // 15% friend referral
                "DEV100": 100      // 100% off for developers
            }
            const discount = validCoupons[coupon_code.toUpperCase()]
            if (discount) {
                const discountAmount = (domainPrice * discount) / 100
                expectedAmount = Math.max(0, domainPrice - discountAmount)
            }
        }

        // Verify the amount matches the expected price (with coupon if applicable)
        if (Number(amount) !== Number(expectedAmount)) {
            return NextResponse.json({
                error: `Amount doesn't match expected price of ₹${expectedAmount}${coupon_code ? ` (with ${coupon_code} coupon)` : ''}`
            }, { status: 400 })
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: Math.round(Number(amount) * 100), // Convert to paisa (smallest currency unit)
            currency: "INR",
            receipt: `domain_${Date.now()}`,
            notes: {
                user_id: user.id,
                domain_name,
                tld,
                portfolio_id,
                coupon_code: coupon_code || '',
                original_price: domainPrice.toString(),
                discounted_price: amount.toString(),
                type: "domain_purchase"
            }
        })

        return NextResponse.json({
            success: true,
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
            domain_name,
            tld,
            coupon_code: coupon_code || null,
            message: "Razorpay order created successfully"
        })
    } catch (error) {
        console.error("Domain purchase error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to initiate domain purchase" },
            { status: 500 }
        )
    }
}