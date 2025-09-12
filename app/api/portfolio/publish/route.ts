import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PortfolioGenerator } from "@/lib/portfolio-generator"

export async function POST(request: NextRequest) {
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

    const { portfolioId, customDomain } = await request.json()

    if (!portfolioId) {
      return NextResponse.json({ error: "Portfolio ID is required" }, { status: 400 })
    }

    const generator = new PortfolioGenerator(supabase)
    await generator.publishPortfolio(portfolioId, customDomain)

    return NextResponse.json({
      success: true,
      message: "Portfolio published successfully",
    })
  } catch (error) {
    console.error("Portfolio publish error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish portfolio" },
      { status: 500 },
    )
  }
}
