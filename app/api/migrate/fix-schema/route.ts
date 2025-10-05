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

        // Check current table structure
        const { data: userDomains, error } = await supabase
            .from("user_domains")
            .select("*")
            .limit(1)

        if (error) {
            console.error("Schema check error:", error)
            return NextResponse.json({
                error: "Failed to check table structure",
                details: error.message
            }, { status: 500 })
        }

        // Check if coupon_code column exists
        const hasCouponColumn = userDomains && userDomains.length > 0 && 'coupon_code' in userDomains[0]

        return NextResponse.json({
            success: true,
            message: "Schema check completed",
            hasCouponColumn,
            tableStructure: userDomains && userDomains.length > 0 ? Object.keys(userDomains[0]) : [],
            recommendation: hasCouponColumn
                ? "Schema is up to date"
                : "Need to add coupon_code column - run the SQL script in Supabase dashboard"
        })
    } catch (error) {
        console.error("Schema check error:", error)
        return NextResponse.json(
            { error: "Schema check failed" },
            { status: 500 }
        )
    }
}