import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TemplateRenderer } from "@/components/template-renderer"

interface PublicPortfolioProps {
    params: { slug: string }
}

export default async function PublicPortfolio({ params }: PublicPortfolioProps) {
    const supabase = await createClient()

    try {
        // Find portfolio by slug
        const { data: portfolio, error } = await supabase
            .from('portfolios')
            .select(`
        *,
        users!portfolios_user_id_fkey (
          name,
          github_username
        )
      `)
            .eq('slug', params.slug)
            .eq('is_published', true)
            .single()

        if (error || !portfolio) {
            notFound()
        }

        // Generate portfolio data structure expected by TemplateRenderer
        const portfolioData = {
            user: {
                id: portfolio.user_id,
                name: portfolio.users?.name || "Portfolio Owner",
                about: "Welcome to my portfolio",
                githubUsername: portfolio.users?.github_username || ""
            },
            projects: [],
            techStack: [],
            contactDetails: {},
            githubData: null,
            ...portfolio.data
        }

        return (
            <div className="min-h-screen">
                {/* Public Portfolio Content */}
                <TemplateRenderer
                    templateId={portfolio.template_id || "minimal-dark"}
                    data={portfolioData}
                />

                {/* Powered by footer */}
                <div className="bg-gray-900 text-center py-4">
                    <p className="text-gray-400 text-sm">
                        Powered by{" "}
                        <a
                            href="/"
                            className="text-violet-400 hover:text-violet-300 font-medium"
                        >
                            AuraGen
                        </a>
                    </p>
                </div>
            </div>
        )
    } catch (error) {
        console.error('Error loading public portfolio:', error)
        notFound()
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PublicPortfolioProps) {
    const supabase = await createClient()

    try {
        const { data: portfolio } = await supabase
            .from('portfolios')
            .select(`
        *,
        users!portfolios_user_id_fkey (
          name,
          github_username
        )
      `)
            .eq('slug', params.slug)
            .eq('is_published', true)
            .single()

        if (portfolio) {
            const userName = portfolio.users?.name || "Portfolio Owner"
            return {
                title: `${userName} - Portfolio`,
                description: `Check out ${userName}'s professional portfolio`,
                openGraph: {
                    title: `${userName} - Portfolio`,
                    description: `Check out ${userName}'s professional portfolio`,
                    type: 'website',
                }
            }
        }
    } catch (error) {
        console.error('Error generating metadata:', error)
    }

    return {
        title: 'Portfolio',
        description: 'Professional Portfolio'
    }
}