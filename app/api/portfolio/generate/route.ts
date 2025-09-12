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

    const { templateId } = await request.json()

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 })
    }

    const generator = new PortfolioGenerator(supabase)
    const portfolio = await generator.generatePortfolio(user.id, templateId)

    return NextResponse.json({
      success: true,
      portfolio,
    })
  } catch (error) {
    console.error("Portfolio generation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate portfolio" },
      { status: 500 },
    )
  }
}
