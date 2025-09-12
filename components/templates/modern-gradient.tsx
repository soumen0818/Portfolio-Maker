"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, ExternalLink, Mail, Linkedin, Twitter, Download } from "lucide-react"

interface PortfolioData {
  user: any
  githubData: any
  techStack: any[]
  projects: any[]
  contactDetails: any
}

export function ModernGradientTemplate({ data }: { data: PortfolioData }) {
  const { user, githubData, techStack, projects, contactDetails } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="text-center">
            {githubData?.profile?.avatar_url && (
              <img
                src={githubData.profile.avatar_url || "/placeholder.svg"}
                alt={user.name}
                className="w-32 h-32 rounded-full mx-auto mb-8 border-4 border-white shadow-xl"
              />
            )}
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              {user.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">{user.about}</p>
            <div className="flex flex-wrap justify-center gap-4">
              {contactDetails.email && (
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Me
                </Button>
              )}
              {user.resumeUrl && (
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Resume
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      {techStack.length > 0 && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Tech Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <Card
                    key={category.category}
                    className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 text-lg text-gray-800">{category.category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {category.technologies.map((tech: any, index: number) => (
                          <Badge
                            key={index}
                            className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-0"
                          >
                            {tech.technology}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="py-16 bg-white/30">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Featured Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <Card
                  key={index}
                  className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">{project.title}</h3>
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
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech: string, techIndex: number) => (
                          <Badge
                            key={techIndex}
                            variant="secondary"
                            className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-0"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Let's Connect
          </h2>
          <p className="text-gray-600 mb-8">I'm always interested in new opportunities and collaborations.</p>
          <div className="flex justify-center gap-4">
            {contactDetails.email && (
              <Button variant="outline" size="lg" asChild>
                <a href={`mailto:${contactDetails.email}`}>
                  <Mail className="w-5 h-5 mr-2" />
                  Email
                </a>
              </Button>
            )}
            {contactDetails.github && (
              <Button variant="outline" size="lg" asChild>
                <a href={contactDetails.github} target="_blank" rel="noopener noreferrer">
                  <Github className="w-5 h-5 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
            {contactDetails.linkedin && (
              <Button variant="outline" size="lg" asChild>
                <a href={contactDetails.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-5 h-5 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
            {contactDetails.twitter && (
              <Button variant="outline" size="lg" asChild>
                <a href={contactDetails.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-5 h-5 mr-2" />
                  Twitter
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
