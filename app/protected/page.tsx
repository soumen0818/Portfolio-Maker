import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Eye, Calendar, Globe, Edit } from "lucide-react"
import Link from "next/link"
import { DeletePortfolioButton } from "@/components/delete-portfolio-button"
import { Navbar } from "@/components/navbar"

export default async function ProtectedPage() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      redirect("/auth/login")
    }

    // Get user profile information with error handling
    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("name, github_username")
      .eq("id", data.user.id)
      .single()

    // Get all portfolios for the user with error handling
    const { data: portfolios, error: portfoliosError } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false })

    // Handle database errors gracefully
    if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found" - acceptable
      console.error("User profile error:", userError)
    }

    if (portfoliosError) {
      console.error("Portfolios error:", portfoliosError)
    }

    // Handle case where user profile doesn't exist yet
    const displayName = userProfile?.name ||
      (data.user.email ? data.user.email.split('@')[0] : null) ||
      "User"

    // Helper function to generate portfolio title
    const getPortfolioTitle = (portfolio: any) => {
      try {
        const baseUsername = userProfile?.github_username ||
          userProfile?.name ||
          (data.user.email ? data.user.email.split('@')[0] : "User");
        const templateName = portfolio.template_id || portfolio.template_name || "Custom";

        // If user has multiple portfolios, add template name for clarity
        if (portfolios && portfolios.length > 1) {
          return `${baseUsername}'s ${templateName} Portfolio`;
        } else {
          return `${baseUsername}'s Portfolio`;
        }
      } catch (error) {
        console.error("Error generating portfolio title:", error);
        return "Portfolio";
      }
    }

    // Helper function to format dates safely
    const formatDate = (dateString: string) => {
      try {
        return dateString ? new Date(dateString).toLocaleDateString() : "Unknown";
      } catch (error) {
        console.error("Error formatting date:", error);
        return "Unknown";
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />

        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {displayName}!
              </h1>
              <p className="text-gray-300">Manage your developer portfolios</p>
            </div>

            <div className="grid gap-6">
              {/* User's Portfolio */}
              {portfolios && portfolios.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolios.map((portfolio) => (
                      <Card key={portfolio.id} className="hover:shadow-lg transition-shadow bg-white/10 backdrop-blur-md border-white/20">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-white">
                              {getPortfolioTitle(portfolio)}
                            </CardTitle>
                            <div className="flex items-center gap-1">
                              {portfolio.is_published ? (
                                <Globe className="w-4 h-4 text-green-400" />
                              ) : (
                                <Calendar className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                          <CardDescription>
                            <div className="space-y-1 text-gray-300">
                              <div>Template: {portfolio.template_id || portfolio.template_name || "Custom"}</div>
                              {userProfile?.github_username && (
                                <div>GitHub: @{userProfile.github_username}</div>
                              )}
                              <div className="flex items-center gap-2 text-xs">
                                <Calendar className="w-3 h-3" />
                                Created: {formatDate(portfolio.created_at)}
                              </div>
                              {portfolio.updated_at && portfolio.updated_at !== portfolio.created_at && (
                                <div className="flex items-center gap-2 text-xs">
                                  <Calendar className="w-3 h-3" />
                                  Updated: {formatDate(portfolio.updated_at)}
                                </div>
                              )}
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Link href={`/portfolio/preview/${portfolio.id}`} className="flex-1">
                                <Button size="sm" className="w-full">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                              </Link>
                              <Link href={`/edit/${portfolio.id}`} className="flex-1">
                                <Button size="sm" variant="outline" className="w-full">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                              </Link>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <DeletePortfolioButton portfolioId={portfolio.id} />
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                              <span>Status: {portfolio.is_published ? "Published" : "Draft"}</span>
                              {portfolio.is_published && (
                                <span className="text-green-400 font-medium">Live</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">No Portfolio Yet</CardTitle>
                    <CardDescription className="text-gray-300">Get started by creating your developer portfolio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/create">
                      <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your Portfolio
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in ProtectedPage:", error)
    // Redirect to login on any unexpected error
    redirect("/auth/login")
  }
}
