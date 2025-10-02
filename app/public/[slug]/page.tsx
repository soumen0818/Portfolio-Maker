import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PortfolioGenerator } from "@/lib/portfolio-generator"
import { TemplateRenderer } from "@/components/template-renderer"

interface PublicPortfolioProps {
    params: Promise<{ slug: string }>
}

export default async function PublicPortfolio({ params }: PublicPortfolioProps) {
    const { slug } = await params
    const supabase = await createClient()

    try {
        // Find portfolio by slug to get the user_id
        const { data: portfolioRecord, error: portfolioError } = await supabase
            .from('portfolios')
            .select(`
                user_id,
                template_id,
                is_published,
                users!portfolios_user_id_fkey (
                    name,
                    github_username
                )
            `)
            .eq('slug', slug)
            .eq('is_published', true)
            .single()

        if (portfolioError || !portfolioRecord) {
            notFound()
        }

        // Use PortfolioGenerator to get complete portfolio data
        const generator = new PortfolioGenerator(supabase)
        const portfolio = await generator.getPortfolio(portfolioRecord.user_id)

        if (!portfolio) {
            notFound()
        }

        return (
            <div className="min-h-screen">
                {/* Public Portfolio Content */}
                <TemplateRenderer
                    templateId={portfolioRecord.template_id || "minimal-dark"}
                    data={{
                        user: portfolio.data.user,
                        techStack: portfolio.data.techStack,
                        projects: portfolio.data.projects,
                        contactDetails: portfolio.data.contactDetails,
                        githubData: null // GitHub data not available in public view
                    }}
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
    const { slug } = await params
    const supabase = await createClient()

    try {
        // Find portfolio by slug to get the user_id
        const { data: portfolioRecord } = await supabase
            .from('portfolios')
            .select(`
                user_id,
                users!portfolios_user_id_fkey (
                    name,
                    github_username
                )
            `)
            .eq('slug', slug)
            .eq('is_published', true)
            .single()

        if (portfolioRecord) {
            // Get complete portfolio data
            const generator = new PortfolioGenerator(supabase)
            const portfolio = await generator.getPortfolio(portfolioRecord.user_id)

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
                    }
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