import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const domain = searchParams.get("domain")

        if (!domain) {
            return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 })
        }

        const supabase = await createClient()

        // Find the domain and get associated portfolio
        const { data: userDomain, error } = await supabase
            .from("user_domains")
            .select(`
        *,
        portfolios!user_domains_portfolio_id_fkey (
          id,
          user_id,
          template_id,
          slug,
          is_published
        ),
        users!user_domains_user_id_fkey (
          name,
          github_username
        )
      `)
            .eq("domain_name", domain)
            .eq("is_active", true)
            .eq("is_verified", true)
            .single()

        if (error || !userDomain) {
            return NextResponse.json({ error: "Domain not found or not verified" }, { status: 404 })
        }

        if (!userDomain.portfolios || !userDomain.portfolios.is_published) {
            return NextResponse.json({ error: "Portfolio not found or not published" }, { status: 404 })
        }

        // Get complete portfolio data
        const { data: portfolioData, error: portfolioError } = await supabase
            .rpc('get_complete_portfolio', { user_id_param: userDomain.portfolios.user_id })

        if (portfolioError || !portfolioData) {
            // Fallback to basic portfolio data
            return NextResponse.json({
                domain: userDomain.domain_name,
                portfolio: {
                    id: userDomain.portfolios.id,
                    user_id: userDomain.portfolios.user_id,
                    template_id: userDomain.portfolios.template_id,
                    user: userDomain.users,
                    techStack: [],
                    projects: [],
                    contactDetails: {}
                }
            })
        }

        return NextResponse.json({
            domain: userDomain.domain_name,
            portfolio: portfolioData
        })
    } catch (error) {
        console.error("Domain lookup error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}