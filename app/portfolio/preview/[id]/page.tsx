import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PortfolioGenerator } from "@/lib/portfolio-generator"
import { TemplateRenderer } from "@/components/template-renderer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Edit, Share } from "lucide-react"
import Link from "next/link"

interface PreviewPageProps {
  params: { id: string }
}

export default async function PreviewPage({ params }: PreviewPageProps) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Portfolio Preview</h1>
              <p className="text-sm text-gray-600">
                Template: {portfolio.templateId} • {portfolio.isPublished ? "Published" : "Draft"}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/create">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              {!portfolio.isPublished && (
                <Button size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Publish
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Preview */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg">
          <TemplateRenderer templateId={portfolio.templateId} data={portfolio.data} />
        </div>
      </div>

      {/* Preview Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Template:</strong> {portfolio.templateId}
              </div>
              <div>
                <strong>Status:</strong> {portfolio.isPublished ? "Published" : "Draft"}
              </div>
              <div>
                <strong>Last Updated:</strong> {new Date(portfolio.generatedAt).toLocaleDateString()}
              </div>
              <div>
                <strong>Projects:</strong> {portfolio.data.projects.length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
