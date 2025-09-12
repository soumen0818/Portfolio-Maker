import { type NextRequest, NextResponse } from "next/server"
import { githubAPI, GitHubAPIError } from "@/lib/github-api"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const user = await githubAPI.getUser(username)

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof GitHubAPIError) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
