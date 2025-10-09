import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Helper function to determine if this is a custom domain
function isCustomDomain(hostname: string): boolean {
  const mainDomains = [
    'localhost',
    '127.0.0.1',
    'vercel.app',
    'netlify.app',
    'railway.app',
    'herokuapp.com',
    'auragen.com', // Replace with your actual main domain
    'portfolio-generator.vercel.app', // Replace with your actual deployment
  ]

  // Check if hostname is NOT one of our main domains
  return !mainDomains.some(domain => hostname.includes(domain))
}

// Helper function to extract domain from hostname
function extractDomain(hostname: string): string {
  // Remove www. prefix if present
  return hostname.replace(/^www\./, '')
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Get hostname from request
  const hostname = request.headers.get("host") || request.nextUrl.hostname
  const isCustom = isCustomDomain(hostname)
  const domain = extractDomain(hostname)

  console.log(`Middleware processing: ${hostname}, isCustom: ${isCustom}, domain: ${domain}`)

  // Handle custom domain routing
  if (isCustom && request.nextUrl.pathname === "/") {
    console.log(`Custom domain detected: ${domain}, routing to /domain page`)
    const url = request.nextUrl.clone()
    url.pathname = "/domain"
    url.searchParams.set("domain", domain)
    return NextResponse.rewrite(url)
  }

  // Handle www redirects for custom domains
  if (isCustom && hostname.startsWith('www.')) {
    const nonWwwHostname = hostname.replace('www.', '')
    const url = request.nextUrl.clone()
    url.hostname = nonWwwHostname
    return NextResponse.redirect(url, 301)
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
    // Create Supabase client
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

    // Get user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Custom domain routing logic
    if (isCustom) {
      console.log(`Processing custom domain: ${domain}`)

      // Allow all paths on custom domains without auth requirements
      // The /domain page will handle portfolio authentication and display
      return supabaseResponse
    }

    // Main application domain authentication logic
    const pathname = request.nextUrl.pathname
    const isPublicPath = pathname.startsWith("/public/") ||
      pathname.startsWith("/domain") ||
      pathname.startsWith("/auth/") ||
      pathname === "/" ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.includes(".")

    // Development mode bypass
    const isDevelopmentMode = process.env.DEVELOPMENT_MODE === 'true'

    if (isDevelopmentMode && pathname.includes("test")) {
      console.log("Development mode: allowing test routes")
      return supabaseResponse
    }

    // Redirect unauthenticated users from protected routes
    if (!user && !isPublicPath) {
      console.log(`Redirecting unauthenticated user from ${pathname} to /auth/login`)
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
