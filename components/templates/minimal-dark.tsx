"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, ExternalLink, Mail, Linkedin, Twitter, MapPin, Calendar } from "lucide-react"

interface PortfolioData {
  user: any
  githubData: any
  techStack: any[]
  projects: any[]
  contactDetails: any
}

export function MinimalDarkTemplate({ data }: { data: PortfolioData }) {
  const { user, githubData, techStack, projects, contactDetails } = data

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-6">
            {githubData?.profile?.avatar_url && (
              <img
                src={githubData.profile.avatar_url || "/placeholder.svg"}
                alt={user.name}
                className="w-20 h-20 rounded-full border-2 border-gray-700"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-gray-400 text-lg mb-3">{user.about}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {githubData?.profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {githubData.profile.location}
                  </div>
                )}
                {githubData?.profile?.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(githubData.profile.created_at).getFullYear()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Tech Stack */}
        {techStack.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Tech Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {techStack
                .reduce((acc: any[], tech) => {
                  const category = acc.find((c) => c.category === tech.category)
                  if (category) {
                    category.technologies.push(tech)
                  } else {
                    acc.push({ category: tech.category, technologies: [tech] })
                  }
                  return acc
                }, [])
                .map((category) => (
                  <Card key={category.category} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 text-gray-300">{category.category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {category.technologies.map((tech: any, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300">
                            {tech.technology}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Projects</h2>
            <div className="grid gap-6">
              {projects.map((project, index) => (
                <Card key={index} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">{project.title}</h3>
                      <div className="flex gap-2">
                        {project.githubUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {project.liveUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 mb-4">{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech: string, techIndex: number) => (
                          <Badge key={techIndex} variant="outline" className="border-gray-700 text-gray-300">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* GitHub Stats */}
        {githubData?.profile && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">GitHub Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{githubData.profile.public_repos}</div>
                  <div className="text-gray-400">Repositories</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{githubData.profile.followers}</div>
                  <div className="text-gray-400">Followers</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{githubData.profile.following}</div>
                  <div className="text-gray-400">Following</div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400">
              © {new Date().getFullYear()} {user.name}. All rights reserved.
            </div>
            <div className="flex gap-4">
              {contactDetails.email && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={`mailto:${contactDetails.email}`}>
                    <Mail className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {contactDetails.github && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={contactDetails.github} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {contactDetails.linkedin && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={contactDetails.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {contactDetails.twitter && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={contactDetails.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
