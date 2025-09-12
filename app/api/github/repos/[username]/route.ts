import { type NextRequest, NextResponse } from "next/server"
import { githubAPI, GitHubAPIError } from "@/lib/github-api"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params
    const { searchParams } = new URL(request.url)
    const pinned = searchParams.get("pinned") === "true"

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const repos = pinned ? await githubAPI.getPinnedRepos(username) : await githubAPI.getUserRepos(username)

    return NextResponse.json({ repos })
  } catch (error) {
    if (error instanceof GitHubAPIError) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
