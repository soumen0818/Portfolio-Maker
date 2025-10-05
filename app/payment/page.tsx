"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Tag, CheckCircle, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from '@/lib/supabase/client'

// Razorpay types
declare global {
    interface Window {
        Razorpay: any;
    }
}

function PaymentPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()
    const [paymentDetails, setPaymentDetails] = useState<any>(null)
    const [couponCode, setCouponCode] = useState("")
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
    const [finalAmount, setFinalAmount] = useState(99)
    const [processing, setProcessing] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        // Get user
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const domain = searchParams.get("domain")
        const tld = searchParams.get("tld")
        const amount = searchParams.get("amount")
        const portfolioId = searchParams.get("portfolioId")
        const demo = searchParams.get("demo") // Add demo mode for testing
        const from = searchParams.get("from") // Track where user came from
        const fullDomain = searchParams.get("fullDomain") // Full domain name for display

        if (domain && tld && amount && portfolioId) {
            const details = {
                domain,
                tld,
                amount: parseFloat(amount),
                portfolioId,
                from: from || 'direct',
                fullDomain: fullDomain || `${domain}${tld}`
            }
            setPaymentDetails(details)
            setFinalAmount(parseFloat(amount))
        } else if (demo === "true") {
            // Demo mode for testing coupon system
            const details = { domain: "testsite", tld: ".com", amount: 99, portfolioId: "demo", from: 'demo' }
            setPaymentDetails(details)
            setFinalAmount(99)
        }
    }, [searchParams])

    const applyCoupon = () => {
        if (!couponCode.trim() || !paymentDetails) return
        const validCoupons: any = {
            "NEWUSER": 10,     // 10% off for new users
            "SAVE20": 20,      // 20% off 
            "FIRST50": 50,     // 50% off first purchase
            "WELCOME25": 25,   // 25% welcome discount
            "STUDENT30": 30,   // 30% student discount
            "EARLY40": 40,     // 40% early bird
            "FRIEND15": 15,    // 15% friend referral
            "DEV100": 100      // 100% off for developers
        }
        const discount = validCoupons[couponCode.toUpperCase()]
        if (discount) {
            const discountAmount = (paymentDetails.amount * discount) / 100
            const newAmount = Math.max(0, paymentDetails.amount - discountAmount) // Ensure amount doesn't go below 0
            setAppliedCoupon({ code: couponCode.toUpperCase(), discount })
            setFinalAmount(newAmount)
            if (discount === 100) {
                alert(`🎉 Development coupon applied! ${discount}% discount - FREE domain!`)
            } else {
                alert(`✅ Coupon applied! ${discount}% discount saved ₹${discountAmount.toFixed(2)}`)
            }
        } else {
            alert("❌ Invalid coupon code")
            setCouponCode("")
        }
    }

    const removeCoupon = () => {
        if (!paymentDetails) return
        setAppliedCoupon(null)
        setFinalAmount(paymentDetails.amount)
        setCouponCode("")
    }

    const processPayment = async () => {
        setProcessing(true)

        // For free domains (DEV100), just proceed
        if (finalAmount === 0) {
            try {
                const response = await fetch('/api/domains/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_order_id: 'free_' + Date.now(),
                        razorpay_payment_id: 'free_payment',
                        razorpay_signature: 'free_signature',
                        domain: paymentDetails.domain + paymentDetails.tld,
                        user_id: user?.id,
                        amount: 0,
                        coupon_code: appliedCoupon?.code || null
                    })
                })

                if (response.ok) {
                    setProcessing(false)
                    setShowSuccess(true)
                    // Auto redirect after success for free domains
                    setTimeout(() => {
                        const redirectUrl = `/protected?payment=success&domain=${encodeURIComponent(paymentDetails.domain + paymentDetails.tld)}&amount=${finalAmount}&free=true`
                        window.location.href = redirectUrl
                    }, 3000)
                } else {
                    alert("❌ Failed to register free domain")
                    setProcessing(false)
                }
            } catch (error) {
                console.error('Free domain registration error:', error)
                alert("❌ Failed to register free domain")
                setProcessing(false)
            }
            return
        }

        // For paid domains, use Razorpay SDK
        try {
            // Create Razorpay order
            const orderResponse = await fetch('/api/domains/purchase-razorpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain_name: paymentDetails.domain + paymentDetails.tld,
                    tld: paymentDetails.tld,
                    amount: finalAmount,
                    portfolio_id: paymentDetails.portfolioId,
                    coupon_code: appliedCoupon?.code || null
                })
            })

            if (!orderResponse.ok) {
                throw new Error('Failed to create order')
            }

            const orderData = await orderResponse.json()

            // Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                const script = document.createElement('script')
                script.src = 'https://checkout.razorpay.com/v1/checkout.js'
                script.onload = () => initializeRazorpay(orderData)
                script.onerror = () => {
                    alert('❌ Failed to load Razorpay. Please try again.')
                    setProcessing(false)
                }
                document.body.appendChild(script)
            } else {
                initializeRazorpay(orderData)
            }

        } catch (error) {
            console.error('Payment error:', error)
            alert('❌ Payment failed. Please try again.')
            setProcessing(false)
        }
    }

    const initializeRazorpay = (orderData: any) => {
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Portfolio Generator',
            description: `Domain purchase: ${paymentDetails.domain + paymentDetails.tld}`,
            order_id: orderData.id,
            handler: async function (response: any) {
                try {
                    // Verify payment
                    const verifyResponse = await fetch('/api/domains/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            domain: paymentDetails.domain + paymentDetails.tld,
                            user_id: user?.id,
                            amount: finalAmount,
                            coupon_code: appliedCoupon?.code || null
                        })
                    })

                    if (verifyResponse.ok) {
                        setProcessing(false)
                        setShowSuccess(true)
                        setTimeout(() => {
                            const redirectUrl = `/protected?payment=success&domain=${encodeURIComponent(paymentDetails.domain + paymentDetails.tld)}&amount=${finalAmount}`
                            window.location.href = redirectUrl
                        }, 3000)
                    } else {
                        alert("❌ Payment verification failed")
                        setProcessing(false)
                    }
                } catch (error) {
                    console.error('Payment verification error:', error)
                    alert("❌ Payment verification failed")
                    setProcessing(false)
                }
            },
            prefill: {
                name: user?.email || '',
                email: user?.email || ''
            },
            notes: {
                domain: paymentDetails.domain + paymentDetails.tld,
                user_id: user?.id || ''
            },
            theme: {
                color: '#16a34a'
            },
            modal: {
                ondismiss: function () {
                    setProcessing(false)
                }
            }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    if (!paymentDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Invalid Payment Request</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            Payment details are missing. Please make sure you access this page with the required parameters:
                        </p>
                        <ul className="text-sm text-gray-500 space-y-1">
                            <li>• domain (e.g., mysite)</li>
                            <li>• tld (e.g., .com)</li>
                            <li>• amount (e.g., 99)</li>
                            <li>• portfolioId</li>
                        </ul>
                        <p className="text-xs text-gray-400">
                            Current URL params: {searchParams.toString() || 'None'}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            <Button onClick={() => router.push('/domain')} className="w-full">
                                Go to Domain Management
                            </Button>
                            <Button
                                onClick={() => router.push('/payment?demo=true')}
                                variant="outline"
                                className="w-full"
                            >
                                🧪 Demo Coupon System
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {paymentDetails.from === 'demo' ? '🧪 Demo: ' : ''}Complete Your Payment
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {paymentDetails.from === 'domain-management'
                            ? 'Apply coupon codes below for instant discounts!'
                            : 'Secure your domain with our easy payment process'
                        }
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CreditCard className="h-5 w-5 mr-2" />
                                Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Domain:</span>
                                    <span className="font-medium">{paymentDetails.domain}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">TLD:</span>
                                    <Badge variant="secondary">{paymentDetails.tld}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Original Price:</span>
                                    <span className={appliedCoupon ? "line-through text-gray-400" : "font-medium"}>
                                        ₹{paymentDetails.amount}
                                    </span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount ({appliedCoupon.code}):</span>
                                        <span>-₹{(paymentDetails.amount - finalAmount).toFixed(2)}</span>
                                    </div>
                                )}
                                <hr />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Amount:</span>
                                    <span className="text-green-600">₹{finalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Coupon Code - Enhanced Section */}
                    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center text-purple-700">
                                <Tag className="h-5 w-5 mr-2" />
                                🎟️ Apply Coupon Code & Save!
                            </CardTitle>
                            <CardDescription className="text-purple-600">
                                Get instant discounts with our special coupon codes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!appliedCoupon ? (
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter coupon code (e.g., DEV100, FIRST50, SAVE20)"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="flex-1 border-purple-300 focus:border-purple-500"
                                        />
                                        <Button onClick={applyCoupon} className="bg-purple-600 hover:bg-purple-700">
                                            Apply
                                        </Button>
                                    </div>

                                    {/* Available Coupons Display */}
                                    <div className="bg-white/70 p-3 rounded-lg">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Available Coupons:</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex justify-between">
                                                <code className="bg-green-100 px-2 py-1 rounded text-green-700">DEV100</code>
                                                <span className="text-green-600 font-bold">100% OFF</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <code className="bg-blue-100 px-2 py-1 rounded text-blue-700">FIRST50</code>
                                                <span className="text-blue-600">50% OFF</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <code className="bg-orange-100 px-2 py-1 rounded text-orange-700">EARLY40</code>
                                                <span className="text-orange-600">40% OFF</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <code className="bg-purple-100 px-2 py-1 rounded text-purple-700">STUDENT30</code>
                                                <span className="text-purple-600">30% OFF</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <code className="bg-pink-100 px-2 py-1 rounded text-pink-700">WELCOME25</code>
                                                <span className="text-pink-600">25% OFF</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <code className="bg-red-100 px-2 py-1 rounded text-red-700">SAVE20</code>
                                                <span className="text-red-600">20% OFF</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border-2 border-green-200">
                                    <div className="flex items-center text-green-700">
                                        <CheckCircle className="h-6 w-6 mr-3" />
                                        <div>
                                            <span className="font-bold text-lg">{appliedCoupon.code}</span>
                                            <span className="ml-2">({appliedCoupon.discount}% off)</span>
                                            <p className="text-sm text-green-600 mt-1">
                                                You saved ₹{(paymentDetails.amount - finalAmount).toFixed(2)}!
                                            </p>
                                        </div>
                                    </div>
                                    <Button onClick={removeCoupon} variant="ghost" size="sm" className="text-green-700 hover:text-green-800">
                                        Remove
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Information - Show for paid domains */}
                    {finalAmount > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Payment Method
                                </CardTitle>
                                <CardDescription>
                                    Secure payment through Razorpay - supports all cards and UPI
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center mb-3">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-white text-sm font-bold">₹</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-blue-900">Razorpay Secure Payment</h4>
                                            <p className="text-sm text-blue-700">Amount: ₹{finalAmount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-blue-700 space-y-1">
                                        <p>✓ All major credit/debit cards accepted</p>
                                        <p>✓ UPI payments (GPay, PhonePe, Paytm, etc.)</p>
                                        <p>✓ Net Banking and Wallets</p>
                                        <p>✓ 256-bit SSL encryption</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        /* Free Domain Message */
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center text-green-600">🎉 Free Domain with DEV100!</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center space-y-3">
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-green-800 font-medium">
                                            Congratulations! Your domain is completely FREE with the DEV100 development coupon.
                                        </p>
                                        <p className="text-green-600 text-sm mt-2">
                                            No payment required - just click "Claim Free Domain" below!
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Development Mode Active</span>
                                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Button */}
                    <Button
                        onClick={processPayment}
                        size="lg"
                        className={`w-full h-12 text-lg font-semibold ${finalAmount === 0
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-green-600 hover:bg-green-700"
                            }`}
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                {finalAmount === 0 ? "Claiming Domain..." : "Processing Payment..."}
                            </>
                        ) : (
                            finalAmount === 0 ? "Claim Free Domain" : `Pay ₹${finalAmount.toFixed(2)} with Razorpay`
                        )}
                    </Button>

                    {/* Security Info */}
                    <div className="text-center text-sm text-gray-600 space-y-1">
                        <p> Your payment is secured with 256-bit SSL encryption</p>
                        <p> We accept all major credit/debit cards and UPI payments</p>
                        <p> 100% secure payment processing</p>
                    </div>
                </div>
            </div>

            {/* Success Dialog */}
            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent className="max-w-md text-center">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <DialogTitle className="text-xl">
                            {finalAmount === 0 ? "🎉 Free Domain Claimed!" : "💳 Payment Successful!"}
                        </DialogTitle>
                        <DialogDescription className="space-y-2 text-center">
                            {finalAmount === 0 ? (
                                <>
                                    Your free domain has been claimed successfully!
                                    <br /><br />
                                    Domain: <strong>{paymentDetails?.domain}{paymentDetails?.tld}</strong>
                                    <br /><br />
                                    Applied Coupon: <strong>{appliedCoupon?.code}</strong> (100% off)
                                    <br /><br />
                                    Your domain will be activated within 24 hours.
                                </>
                            ) : (
                                <>
                                    Your payment of ₹{finalAmount.toFixed(2)} has been processed successfully.
                                    <br /><br />
                                    Domain: <strong>{paymentDetails?.domain}{paymentDetails?.tld}</strong>
                                    <br /><br />
                                    Your domain will be activated within 24 hours.
                                </>
                            )}
                            <br /><br />
                            <span className="text-sm text-gray-500">Redirecting to domain management...</span>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Loading Payment...</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        }>
            <PaymentPageContent />
        </Suspense>
    )
}
