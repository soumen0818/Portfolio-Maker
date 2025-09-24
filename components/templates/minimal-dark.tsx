"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, ExternalLink, Mail, Linkedin, Twitter, MapPin, Download, Globe, Instagram, Phone } from "lucide-react"

interface PortfolioData {
  user: any
  githubData: any
  techStack: any[]
  projects: any[]
  contactDetails: any
}

// Tech stack icons mapping
const getTechIcon = (tech: string) => {
  const techLower = tech.toLowerCase()
  if (techLower.includes('react')) return '⚛️'
  if (techLower.includes('javascript') || techLower.includes('js')) return '🟨'
  if (techLower.includes('typescript') || techLower.includes('ts')) return '🔷'
  if (techLower.includes('python')) return '🐍'
  if (techLower.includes('node')) return '🟢'
  if (techLower.includes('java')) return '☕'
  if (techLower.includes('html')) return '🧡'
  if (techLower.includes('css')) return '🎨'
  if (techLower.includes('sql') || techLower.includes('database')) return '🗄️'
  if (techLower.includes('docker')) return '🐳'
  if (techLower.includes('aws') || techLower.includes('cloud')) return '☁️'
  if (techLower.includes('git')) return '📁'
  return '⚡'
}

export function MinimalDarkTemplate({ data }: { data: PortfolioData }) {
  const { user, githubData, techStack, projects, contactDetails } = data

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            {(user.profilePhoto || githubData?.profile?.avatar_url) && (
              <img
                src={user.profilePhoto || githubData?.profile?.avatar_url || "/placeholder.svg"}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-blue-500 mx-auto mb-6 shadow-lg shadow-blue-500/25"
              />
            )}
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {user.name}
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed">
              {user.about}
            </p>
            
            {/* Personal Details */}
            <div className="flex flex-wrap justify-center gap-6 text-gray-300 mb-8">
              {(user.location || githubData?.profile?.location) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span>{user.location || githubData.profile.location}</span>
                </div>
              )}
              {user.domain && (
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-400" />
                  <span>{user.domain}</span>
                </div>
              )}
              {githubData?.profile?.created_at && (
                <div className="flex items-center gap-2">
                  <Github className="w-5 h-5 text-purple-400" />
                  <span>Since {new Date(githubData.profile.created_at).getFullYear()}</span>
                </div>
              )}
            </div>

            {/* Resume Download */}
            {user.resumeUrl && (
              <div className="mb-8">
                <Button 
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-600/25"
                >
                  <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="w-5 h-5 mr-2" />
                    Download Resume
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      {techStack && techStack.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Tech Stack
              </span>
            </h2>
            <p className="text-gray-400 text-center mb-12 text-lg">
              Technologies I work with
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {techStack.map((tech, index) => (
                <Card key={`tech-${index}-${tech.technology || tech}`} 
                      className="bg-gray-900/50 border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">
                      {getTechIcon(tech.technology || tech)}
                    </div>
                    <h3 className="font-semibold text-white mb-1">
                      {tech.technology || tech}
                    </h3>
                    {tech.category && (
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {tech.category}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <section className="py-20 px-6 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Featured Projects
              </span>
            </h2>
            <p className="text-gray-400 text-center mb-12 text-lg">
              Some of my recent work
            </p>
            
            <div className="grid gap-8 md:grid-cols-2">
              {projects.map((project, index) => (
                <Card key={`project-${index}-${project.title}`} 
                      className="bg-gray-900/80 border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-2xl font-bold text-white leading-tight">
                        {project.title}
                      </h3>
                      <div className="flex gap-3 ml-4">
                        {project.githubUrl && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild
                            className="hover:bg-gray-800 hover:text-white p-2 rounded-full"
                          >
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="w-5 h-5" />
                            </a>
                          </Button>
                        )}
                        {project.liveUrl && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild
                            className="hover:bg-gray-800 hover:text-white p-2 rounded-full"
                          >
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-400 mb-6 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge 
                            key={`${project.title}-tech-${techIndex}-${tech}`} 
                            variant="outline" 
                            className="border-gray-700 text-gray-300 hover:border-purple-500 transition-colors"
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

      {/* GitHub Stats Section */}
      {githubData?.profile && (
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-300">GitHub Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-900/50 border-gray-800 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{githubData.profile.public_repos}</div>
                  <div className="text-gray-400">Public Repositories</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">{githubData.profile.followers}</div>
                  <div className="text-gray-400">Followers</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{githubData.profile.following}</div>
                  <div className="text-gray-400">Following</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Get In Touch
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            Let's connect and discuss opportunities, collaborations, or just have a chat about technology!
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            {contactDetails.email && (
              <Button 
                variant="outline" 
                size="lg" 
                asChild
                className="border-gray-700 text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300 hover:scale-105 px-6 py-3"
              >
                <a href={`mailto:${contactDetails.email}`} className="flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  <span className="hidden sm:inline">Email</span>
                </a>
              </Button>
            )}
            
            {contactDetails.linkedin && (
              <Button 
                variant="outline" 
                size="lg" 
                asChild
                className="border-gray-700 text-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 hover:scale-105 px-6 py-3"
              >
                <a href={contactDetails.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  <Linkedin className="w-5 h-5" />
                  <span className="hidden sm:inline">LinkedIn</span>
                </a>
              </Button>
            )}
            
            {contactDetails.github && (
              <Button 
                variant="outline" 
                size="lg" 
                asChild
                className="border-gray-700 text-white hover:bg-gray-600 hover:border-gray-600 transition-all duration-300 hover:scale-105 px-6 py-3"
              >
                <a href={contactDetails.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  <Github className="w-5 h-5" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </Button>
            )}
            
            {contactDetails.twitter && (
              <Button 
                variant="outline" 
                size="lg" 
                asChild
                className="border-gray-700 text-white hover:bg-blue-400 hover:border-blue-400 transition-all duration-300 hover:scale-105 px-6 py-3"
              >
                <a href={contactDetails.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  <Twitter className="w-5 h-5" />
                  <span className="hidden sm:inline">Twitter</span>
                </a>
              </Button>
            )}
            
            {contactDetails.instagram && (
              <Button 
                variant="outline" 
                size="lg" 
                asChild
                className="border-gray-700 text-white hover:bg-pink-600 hover:border-pink-600 transition-all duration-300 hover:scale-105 px-6 py-3"
              >
                <a href={contactDetails.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  <Instagram className="w-5 h-5" />
                  <span className="hidden sm:inline">Instagram</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} {user.name}. Built with passion and code.
          </p>
        </div>
      </footer>
    </div>
  )
}
