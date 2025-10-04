import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url)
        const domain = searchParams.get("domain")

        if (!domain) {
            return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 })
        }

        // Basic domain validation
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/
        if (!domainRegex.test(domain)) {
            return NextResponse.json({
                error: "Invalid domain format",
                available: false
            }, { status: 400 })
        }

        // Check if domain is already taken in our system
        const { data: existingDomains, error: checkError } = await supabase
            .from("user_domains")
            .select("domain_name")
            .like("domain_name", `${domain}.%`)

        if (checkError) {
            console.error("Domain check error:", checkError)
            return NextResponse.json({ error: "Failed to check domain availability" }, { status: 500 })
        }

        // Get available TLDs with pricing
        const { data: availableTlds, error: tldError } = await supabase
            .from("domains")
            .select("*")
            .eq("is_available", true)

        if (tldError) {
            return NextResponse.json({ error: "Failed to fetch available domains" }, { status: 500 })
        }

        // Check which combinations are available
        const availability = availableTlds.map(tld => {
            const fullDomain = `${domain}${tld.tld}`
            const isTaken = existingDomains?.some(existing => existing.domain_name === fullDomain)

            return {
                tld: tld.tld,
                price: tld.price_usd,
                renewal_price: tld.renewal_price_usd,
                available: !isTaken,
                full_domain: fullDomain
            }
        })

        return NextResponse.json({
            domain,
            availability,
            message: "Domain availability checked successfully"
        })
    } catch (error) {
        console.error("Domain check error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}