import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if this is a custom domain (not the main application domain)
  const hostname = request.headers.get("host") || request.nextUrl.hostname
  const isCustomDomain = !hostname.includes("localhost") &&
    !hostname.includes("vercel.app") &&
    !hostname.includes("your-main-domain.com") && // Replace with your actual domain
    hostname !== request.nextUrl.hostname

  // If it's a custom domain, route to the domain page
  if (isCustomDomain && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/domain"
    url.searchParams.set("domain", hostname)
    return NextResponse.rewrite(url)
  }

  // Debug environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables:")
    console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓ Set" : "✗ Missing")
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Set" : "✗ Missing")
    return supabaseResponse
  }

  if (supabaseUrl === "your_supabase_project_url_here" || supabaseAnonKey === "your_supabase_anon_key_here") {
    console.error("Supabase environment variables contain placeholder values")
    return supabaseResponse
  }

  try {
    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getUser() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Check if this is a custom domain for auth logic
    const hostname = request.headers.get("host") || request.nextUrl.hostname
    const isCustomDomain = !hostname.includes("localhost") &&
      !hostname.includes("vercel.app") &&
      !hostname.includes("your-main-domain.com") && // Replace with your actual domain
      hostname !== request.nextUrl.hostname

    if (
      request.nextUrl.pathname !== "/" &&
      !user &&
      !request.nextUrl.pathname.startsWith("/login") &&
      !request.nextUrl.pathname.startsWith("/auth") &&
      !request.nextUrl.pathname.startsWith("/public/") &&
      !request.nextUrl.pathname.startsWith("/domain") &&
      !isCustomDomain
    ) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    console.error("Supabase middleware error:", error)
    return supabaseResponse
  }
}
