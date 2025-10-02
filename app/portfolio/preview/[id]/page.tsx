import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PortfolioGenerator } from "@/lib/portfolio-generator"
import { TemplateRenderer } from "@/components/template-renderer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, ArrowLeft, Eye, Globe } from "lucide-react"
import Link from "next/link"

interface PreviewPageProps {
  params: Promise<{ id: string }>
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  const generator = new PortfolioGenerator(supabase)
  const portfolio = await generator.getPortfolio(user.id)

  if (!portfolio) {
    redirect("/create")
  }

  // Function to handle publishing
  const handlePublish = async () => {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    try {
      // Update portfolio to published status
      const { error } = await supabase
        .from('portfolios')
        .update({
          is_published: true,
          slug: `${user.id}-${Date.now()}` // Generate a unique slug
        })
        .eq('user_id', user.id)

      if (!error) {
        // Redirect to refresh the page with updated status
        redirect(`/portfolio/preview/${id}`)
      }
    } catch (error) {
      console.error('Error publishing portfolio:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Preview Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/protected">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-violet-400" />
                  Portfolio Preview
                </h1>
                <p className="text-sm text-gray-300">
                  Template: {portfolio.templateId} •
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${portfolio.isPublished
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}>
                    {portfolio.isPublished ? "Published" : "Draft"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {!portfolio.isPublished ? (
                <form action={handlePublish}>
                  <Button type="submit" size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                    <Globe className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                </form>
              ) : (
                <Link href={`/public/${portfolio.slug || `${user.id}-portfolio`}`} target="_blank">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Public
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Preview */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-300 font-mono">
                preview.aura-gen.dev
              </div>
            </div>
          </div>

          {/* Actual Portfolio Content */}
          <div className="portfolio-content">
            <TemplateRenderer
              templateId={portfolio.templateId || "minimal-dark"}
              data={{
                user: portfolio.data.user,
                techStack: portfolio.data.techStack,
                projects: portfolio.data.projects,
                contactDetails: portfolio.data.contactDetails,
                githubData: null // GitHub data not available in portfolio generator yet
              }}
            />
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full mr-3"></div>
              Portfolio Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-300">Template:</span>
                  <span className="text-white font-medium bg-violet-600/20 px-2 py-1 rounded-md text-xs">
                    {portfolio.templateId}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-300">Status:</span>
                  <span className={`font-medium px-2 py-1 rounded-md text-xs ${portfolio.isPublished
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                    {portfolio.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-300">Last Updated:</span>
                  <span className="text-white font-medium text-xs">
                    {new Date(portfolio.generatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-300">Projects:</span>
                  <span className="text-white font-medium bg-blue-600/20 px-2 py-1 rounded-md text-xs">
                    {portfolio.data.projects.length} projects
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Menu */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg">
          <div className="text-xs text-gray-300 mb-2 font-medium">Quick Actions</div>
          <div className="flex flex-col space-y-2">
            {!portfolio.isPublished ? (
              <form action={handlePublish}>
                <Button type="submit" size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs w-full">
                  <Globe className="w-3 h-3 mr-1" />
                  Publish
                </Button>
              </form>
            ) : (
              <Link href={`/public/${portfolio.slug || `${user.id}-portfolio`}`} target="_blank">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs w-full">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Public
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
