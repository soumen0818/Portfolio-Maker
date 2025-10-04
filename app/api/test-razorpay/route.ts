import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

export async function POST(request: NextRequest) {
    try {
        console.log("🧪 Testing Razorpay configuration...")

        // Check environment variables
        const keyId = process.env.RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET

        if (!keyId || !keySecret) {
            console.log("❌ Missing Razorpay credentials")
            return NextResponse.json(
                {
                    error: "Missing Razorpay credentials",
                    details: {
                        keyId: keyId ? "✅ Present" : "❌ Missing",
                        keySecret: keySecret ? "✅ Present" : "❌ Missing"
                    }
                },
                { status: 400 }
            )
        }

        console.log("✅ Environment variables found")
        console.log("📋 Key ID:", keyId.substring(0, 10) + "...")

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        })

        console.log("✅ Razorpay instance created")

        // Test creating a small order
        const testOrder = await razorpay.orders.create({
            amount: 100, // ₹1.00 in paise
            currency: "INR",
            receipt: "test_receipt_" + Date.now(),
        })

        console.log("✅ Test order created:", testOrder.id)

        return NextResponse.json({
            success: true,
            message: "Razorpay configuration is working!",
            testOrder: {
                id: testOrder.id,
                amount: testOrder.amount,
                currency: testOrder.currency,
                status: testOrder.status
            },
            config: {
                keyId: keyId.substring(0, 10) + "...",
                environment: process.env.NODE_ENV
            }
        })

    } catch (error: any) {
        console.error("❌ Razorpay test failed:", error)

        return NextResponse.json(
            {
                error: "Razorpay test failed",
                details: error.message,
                type: error.constructor.name
            },
            { status: 500 }
        )
    }
}