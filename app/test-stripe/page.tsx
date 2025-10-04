"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RazorpayTestPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState("")

    const testRazorpayConnection = async () => {
        setLoading(true)
        setResult("")

        try {
            const response = await fetch("/api/test-razorpay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    test: true
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setResult("✅ Razorpay connection successful!")
            } else {
                setResult(`❌ Error: ${data.error}`)
            }
        } catch (error) {
            setResult(`❌ Network error: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-8">
            <div className="max-w-2xl mx-auto">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardHeader>
                        <CardTitle className="text-white">Razorpay Configuration Test</CardTitle>
                        <CardDescription className="text-gray-300">
                            Test your Razorpay setup before using domain purchasing
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={testRazorpayConnection}
                            disabled={loading}
                            className="w-full bg-violet-600 hover:bg-violet-700"
                        >
                            {loading ? "Testing..." : "Test Razorpay Connection"}
                        </Button>

                        {result && (
                            <div className="p-4 bg-white/5 rounded-lg">
                                <p className="text-white">{result}</p>
                            </div>
                        )}

                        <div className="space-y-2 text-sm text-gray-300">
                            <h3 className="font-semibold text-white">Setup Checklist:</h3>
                            <div>✅ Razorpay account created</div>
                            <div>✅ API keys added to .env.local</div>
                            <div>✅ Razorpay script loaded</div>
                            <div>⏳ Test connection successful</div>
                        </div>

                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
                            <h4 className="text-blue-300 font-semibold mb-2">Next Steps:</h4>
                            <ol className="text-sm text-blue-100 space-y-1 list-decimal list-inside">
                                <li>Get your Razorpay Test API keys</li>
                                <li>Update .env.local with real keys</li>
                                <li>Restart your dev server</li>
                                <li>Test the connection here</li>
                                <li>Try domain purchasing in dashboard</li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}