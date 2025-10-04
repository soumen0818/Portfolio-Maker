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

        // Get user's domains
        const { data: userDomains, error } = await supabase
            .from("user_domains")
            .select(`
        *,
        portfolios!user_domains_portfolio_id_fkey (
          id,
          template_id,
          is_published
        )
      `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("User domains fetch error:", error)
            return NextResponse.json({ error: "Failed to fetch user domains" }, { status: 500 })
        }

        return NextResponse.json({ domains: userDomains || [] })
    } catch (error) {
        console.error("User domains error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}