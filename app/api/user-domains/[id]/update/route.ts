import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

        const { portfolio_id } = await request.json()

        if (!portfolio_id) {
            return NextResponse.json({ error: "Portfolio ID is required" }, { status: 400 })
        }

        // Verify the domain belongs to the user
        const { data: userDomain, error: domainError } = await supabase
            .from("user_domains")
            .select("id")
            .eq("id", id)
            .eq("user_id", user.id)
            .single()

        if (domainError || !userDomain) {
            return NextResponse.json({ error: "Domain not found" }, { status: 404 })
        }

        // Verify the portfolio belongs to the user and is published
        const { data: portfolio, error: portfolioError } = await supabase
            .from("portfolios")
            .select("id, is_published")
            .eq("id", portfolio_id)
            .eq("user_id", user.id)
            .single()

        if (portfolioError || !portfolio) {
            return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
        }

        if (!portfolio.is_published) {
            return NextResponse.json({ error: "Portfolio must be published" }, { status: 400 })
        }

        // Update the domain
        const { error: updateError } = await supabase
            .from("user_domains")
            .update({
                portfolio_id,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)

        if (updateError) {
            return NextResponse.json({ error: "Failed to update domain" }, { status: 500 })
        }

        // Update or create domain mapping
        const { error: mappingError } = await supabase
            .from("domain_mappings")
            .upsert({
                user_domain_id: id,
                portfolio_id,
                is_active: true,
                updated_at: new Date().toISOString(),
            })

        if (mappingError) {
            console.error("Error updating domain mapping:", mappingError)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Domain update error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}