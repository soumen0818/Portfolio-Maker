import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is authenticated (you might want to add admin check here)
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        console.log('Running database migration...')

        // Try to add the new columns to the users table
        const { error } = await supabase.rpc('run_sql', {
            query: `
        ALTER TABLE public.users 
        ADD COLUMN IF NOT EXISTS domain TEXT,
        ADD COLUMN IF NOT EXISTS location TEXT,
        ADD COLUMN IF NOT EXISTS profile_photo TEXT;
      `
        })

        if (error) {
            console.error('Migration failed:', error)
            return NextResponse.json({
                error: `Migration failed: ${error.message}`,
                details: error
            }, { status: 500 })
        }

        console.log('✅ Migration completed successfully!')

        return NextResponse.json({
            success: true,
            message: "Database migration completed successfully",
            addedColumns: ["domain", "location", "profile_photo"]
        })

    } catch (error) {
        console.error("Migration error:", error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Migration failed"
        }, { status: 500 })
    }
}