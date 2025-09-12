import { type NextRequest, NextResponse } from "next/server"
import { githubAPI } from "@/lib/github-api"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const isValid = await githubAPI.validateUsername(username)

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
