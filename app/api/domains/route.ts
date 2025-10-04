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

        // Get all available domains
        const { data: domains, error } = await supabase
            .from("domains")
            .select("*")
            .eq("is_available", true)
            .order("price_usd", { ascending: true })

        if (error) {
            return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 })
        }

        return NextResponse.json({ domains })
    } catch (error) {
        console.error("Domain fetch error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}