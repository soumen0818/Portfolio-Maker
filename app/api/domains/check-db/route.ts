import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is authenticated and is admin (optional check)
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get current domains table structure and data
        const { data: domains, error } = await supabase
            .from("domains")
            .select("*")
            .order("tld")

        if (error) {
            console.error("Database check error:", error)
            return NextResponse.json({ error: "Failed to check database" }, { status: 500 })
        }

        // Check if INR columns exist
        const hasInrColumns = domains && domains.length > 0 &&
            'price_inr' in domains[0] &&
            'renewal_price_inr' in domains[0]

        return NextResponse.json({
            success: true,
            hasInrColumns,
            domains,
            message: hasInrColumns ? "INR columns exist" : "INR columns need to be added"
        })
    } catch (error) {
        console.error("Database check error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}