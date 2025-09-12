import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Eye, Edit, Calendar, Globe } from "lucide-react"
import Link from "next/link"

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get all portfolios for the user
  const { data: portfolios } = await supabase.from("portfolios").select("*").eq("user_id", data.user.id).order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">Manage your developer portfolios</p>
        </div>

        <div className="grid gap-6">
          {/* Create New Portfolio Button */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Portfolio</CardTitle>
              <CardDescription>Build a new developer portfolio to showcase your work</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Portfolio
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* User's Portfolios */}
          {portfolios && portfolios.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Your Portfolios</h2>
                <span className="text-sm text-gray-500">{portfolios.length} portfolio{portfolios.length > 1 ? 's' : ''}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map((portfolio) => (
                  <Card key={portfolio.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{portfolio.personal_details?.name || "Untitled Portfolio"}</CardTitle>
                        <div className="flex items-center gap-1">
                          {portfolio.is_published ? (
                            <Globe className="w-4 h-4 text-green-600" />
                          ) : (
                            <Edit className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <CardDescription>
                        <div className="space-y-1">
                          <div>Template: {portfolio.template_name}</div>
                          <div className="flex items-center gap-2 text-xs">
                            <Calendar className="w-3 h-3" />
                            Created: {new Date(portfolio.created_at).toLocaleDateString()}
                          </div>
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
                          <Link href="/create" className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                          <span>Status: {portfolio.is_published ? "Published" : "Draft"}</span>
                          {portfolio.is_published && (
                            <span className="text-green-600 font-medium">Live</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Portfolios Yet</CardTitle>
                <CardDescription>Get started by creating your first developer portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Portfolio
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{portfolios?.length || 0}</div>
                  <div className="text-sm text-gray-600">Portfolios Created</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {portfolios?.filter(p => p.is_published).length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Published</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Views This Month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
