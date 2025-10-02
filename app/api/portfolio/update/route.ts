import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PortfolioGenerator } from "@/lib/portfolio-generator"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { portfolioId, templateId } = await request.json()

        if (!portfolioId) {
            return NextResponse.json({ message: "Portfolio ID is required" }, { status: 400 })
        }

        // Verify the portfolio belongs to the user
        const { data: existingPortfolio, error: portfolioError } = await supabase
            .from("portfolios")
            .select("user_id")
            .eq("id", portfolioId)
            .eq("user_id", user.id)
            .single()

        if (portfolioError || !existingPortfolio) {
            return NextResponse.json({ message: "Portfolio not found or unauthorized" }, { status: 404 })
        }

        // Generate updated portfolio with current user data
        const generator = new PortfolioGenerator(supabase)
        const updatedPortfolio = await generator.generatePortfolio(user.id, templateId || "minimal-dark")

        // Update the existing portfolio record
        const { error: updateError } = await supabase
            .from("portfolios")
            .update({
                template_id: templateId || "minimal-dark",
                data: updatedPortfolio.data,
                updated_at: new Date().toISOString()
            })
            .eq("id", portfolioId)
            .eq("user_id", user.id)

        if (updateError) {
            console.error("Error updating portfolio:", updateError)
            return NextResponse.json({ message: "Failed to update portfolio" }, { status: 500 })
        }

        return NextResponse.json({
            message: "Portfolio updated successfully",
            portfolio: {
                ...updatedPortfolio,
                id: portfolioId
            }
        })

    } catch (error) {
        console.error("Portfolio update error:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}