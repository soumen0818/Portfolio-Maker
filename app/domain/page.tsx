import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PortfolioGenerator } from "@/lib/portfolio-generator"
import { TemplateRenderer } from "@/components/template-renderer"

interface CustomDomainPageProps {
    searchParams: Promise<{ domain?: string }>
}

export default async function CustomDomainPage({ searchParams }: CustomDomainPageProps) {
    const { domain } = await searchParams

    if (!domain) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h1 className="text-2xl font-bold mb-4">Domain Required</h1>
                    <p className="text-gray-300">No domain specified in the URL</p>
                </div>
            </div>
        )
    }

    try {
        const supabase = await createClient()

        // Find the domain and get associated portfolio
        const { data: userDomain, error } = await supabase
            .from("user_domains")
            .select(`
        *,
        portfolios!user_domains_portfolio_id_fkey (
          id,
          user_id,
          template_id,
          slug,
          is_published
        )
      `)
            .eq("domain_name", domain)
            .eq("is_active", true)
            .eq("is_verified", true)
            .single()

        if (error || !userDomain) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
                    <div className="text-center text-white">
                        <h1 className="text-2xl font-bold mb-4">Domain Not Found</h1>
                        <p className="text-gray-300">
                            The domain {domain} is not configured or verified.
                        </p>
                    </div>
                </div>
            )
        }

        if (!userDomain.portfolios || !userDomain.portfolios.is_published) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
                    <div className="text-center text-white">
                        <h1 className="text-2xl font-bold mb-4">Portfolio Not Available</h1>
                        <p className="text-gray-300">
                            The portfolio for this domain is not published or not found.
                        </p>
                    </div>
                </div>
            )
        }

        // Get complete portfolio data using PortfolioGenerator
        const generator = new PortfolioGenerator(supabase)
        const portfolio = await generator.getPortfolio(userDomain.portfolios.user_id)

        if (!portfolio) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
                    <div className="text-center text-white">
                        <h1 className="text-2xl font-bold mb-4">Portfolio Error</h1>
                        <p className="text-gray-300">
                            Unable to load portfolio data for this domain.
                        </p>
                    </div>
                </div>
            )
        }

        return (
            <div className="min-h-screen">
                {/* Custom Domain Portfolio Content */}
                <TemplateRenderer
                    templateId={userDomain.portfolios.template_id || "minimal-dark"}
                    data={{
                        user: portfolio.data.user,
                        techStack: portfolio.data.techStack,
                        projects: portfolio.data.projects,
                        contactDetails: portfolio.data.contactDetails,
                        githubData: null // GitHub data not available in public view
                    }}
                />

                {/* Powered by footer with custom domain branding */}
                <div className="bg-gray-900 text-center py-4">
                    <p className="text-gray-400 text-sm">
                        Portfolio hosted on{" "}
                        <span className="text-violet-400 font-medium">{domain}</span>
                        {" "}• Powered by{" "}
                        <a
                            href="https://your-platform-domain.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-400 hover:text-violet-300 font-medium"
                        >
                            AuraGen
                        </a>
                    </p>
                </div>
            </div>
        )
    } catch (error) {
        console.error("Error loading custom domain portfolio:", error)
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h1 className="text-2xl font-bold mb-4">Error</h1>
                    <p className="text-gray-300">
                        An error occurred while loading the portfolio.
                    </p>
                </div>
            </div>
        )
    }
}

// Generate metadata for SEO on custom domains
export async function generateMetadata({ searchParams }: CustomDomainPageProps) {
    const { domain } = await searchParams

    if (!domain) {
        return {
            title: "Portfolio",
            description: "Professional Portfolio"
        }
    }

    try {
        const supabase = await createClient()

        const { data: userDomain } = await supabase
            .from("user_domains")
            .select(`
        *,
        portfolios!user_domains_portfolio_id_fkey (
          user_id
        )
      `)
            .eq("domain_name", domain)
            .eq("is_active", true)
            .eq("is_verified", true)
            .single()

        if (userDomain && userDomain.portfolios) {
            const generator = new PortfolioGenerator(supabase)
            const portfolio = await generator.getPortfolio(userDomain.portfolios.user_id)

            if (portfolio) {
                const userName = portfolio.data.user.name || "Portfolio Owner"
                const userAbout = portfolio.data.user.about || `Check out ${userName}'s professional portfolio`

                return {
                    title: `${userName} - Portfolio`,
                    description: userAbout,
                    openGraph: {
                        title: `${userName} - Portfolio`,
                        description: userAbout,
                        type: 'website',
                        url: `https://${domain}`,
                    },
                    twitter: {
                        card: 'summary_large_image',
                        title: `${userName} - Portfolio`,
                        description: userAbout,
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error generating metadata for custom domain:", error)
    }

    return {
        title: `Portfolio - ${domain}`,
        description: "Professional Portfolio"
    }
}