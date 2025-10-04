import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()

        // Check if user is authenticated
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get the domain
        const { data: userDomain, error: domainError } = await supabase
            .from("user_domains")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single()

        if (domainError || !userDomain) {
            return NextResponse.json({ error: "Domain not found" }, { status: 404 })
        }

        // Simulate DNS verification (in a real app, you would check actual DNS records)
        const isDnsVerified = await simulateDnsVerification(userDomain.domain_name)

        if (!isDnsVerified) {
            return NextResponse.json({
                error: "DNS verification failed. Please check your DNS configuration and try again.",
                verified: false
            }, { status: 400 })
        }

        // Update domain as verified
        const { error: updateError } = await supabase
            .from("user_domains")
            .update({
                is_verified: true,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)

        if (updateError) {
            return NextResponse.json({ error: "Failed to update domain verification status" }, { status: 500 })
        }

        // Update domain mapping
        const { error: mappingError } = await supabase
            .from("domain_mappings")
            .update({
                dns_configured: true,
                ssl_status: "active",
                updated_at: new Date().toISOString(),
            })
            .eq("user_domain_id", id)

        if (mappingError) {
            console.error("Error updating domain mapping:", mappingError)
        }

        return NextResponse.json({
            success: true,
            verified: true,
            message: "Domain verified successfully!"
        })
    } catch (error) {
        console.error("Domain verification error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// Simulate DNS verification - in a real app, you would use a DNS lookup service
async function simulateDnsVerification(domain: string): Promise<boolean> {
    try {
        // Simulate a delay for DNS check
        await new Promise(resolve => setTimeout(resolve, 2000))

        // For demo purposes, always return true after delay
        // In a real app, you would check if:
        // 1. A record points to your server IP
        // 2. CNAME record points to your platform
        // 3. Domain resolves correctly

        console.log(`Simulating DNS verification for ${domain}`)
        return true
    } catch (error) {
        console.error("DNS verification failed:", error)
        return false
    }
}