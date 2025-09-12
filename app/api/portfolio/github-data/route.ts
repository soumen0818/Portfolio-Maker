import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { githubAPI } from "@/lib/github-api"

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

    const { githubUsername } = await request.json()

    if (!githubUsername) {
      return NextResponse.json({ error: "GitHub username is required" }, { status: 400 })
    }

    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single()

    if (userCheckError && userCheckError.code === "PGRST116") {
      const { error: createUserError } = await supabase.from("users").insert({
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        about: "Developer passionate about creating amazing software solutions.", // Default about text
        github_username: githubUsername,
      })

      if (createUserError) {
        console.error("Failed to create user:", createUserError.message)
        return NextResponse.json({ error: `Failed to create user: ${createUserError.message}` }, { status: 500 })
      }
    } else if (userCheckError) {
      console.error("User check error:", userCheckError)
      return NextResponse.json({ error: "Failed to verify user" }, { status: 500 })
    }

    // Fetch GitHub data
    const [userData, pinnedRepos, contributions] = await Promise.all([
      githubAPI.getUser(githubUsername),
      githubAPI.getPinnedRepos(githubUsername),
      githubAPI.getContributions(githubUsername),
    ])

    // Store in database
    const { data, error } = await supabase
      .from("github_data")
      .upsert(
        {
          user_id: user.id,
          github_username: githubUsername,
          profile_data: userData,
          pinned_repos: pinnedRepos,
          contribution_data: contributions,
          last_updated: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save GitHub data" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: userData,
        repos: pinnedRepos,
        contributions,
      },
    })
  } catch (error) {
    console.error("GitHub data fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch GitHub data" }, { status: 500 })
  }
}

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

    // Get cached GitHub data
    const { data, error } = await supabase.from("github_data").select("*").eq("user_id", user.id).single()

    if (error) {
      return NextResponse.json({ error: "No GitHub data found" }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        profile: data.profile_data,
        repos: data.pinned_repos,
        contributions: data.contribution_data,
        lastUpdated: data.last_updated,
      },
    })
  } catch (error) {
    console.error("Get GitHub data error:", error)
    return NextResponse.json({ error: "Failed to get GitHub data" }, { status: 500 })
  }
}
