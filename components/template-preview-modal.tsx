"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TemplateRenderer } from "./template-renderer"
import { getTemplateById } from "@/lib/templates"
import { X, Check } from "lucide-react"

interface TemplatePreviewModalProps {
  templateId: string | null
  isOpen: boolean
  onClose: () => void
  onSelect?: (templateId: string) => void
  selectedTemplate?: string | null
}

// Mock data for template preview
const mockPortfolioData = {
  user: {
    id: "mock-user",
    name: "Alex Developer",
    about:
      "Full-stack developer passionate about creating amazing web experiences. I love working with modern technologies and building scalable applications.",
    resumeUrl: "#",
    githubUsername: "alexdev",
  },
  githubData: {
    profile: {
      avatar_url: "/developer-avatar.png",
      login: "alexdev",
      name: "Alex Developer",
      bio: "Full-stack developer passionate about creating amazing web experiences",
      public_repos: 42,
      followers: 156,
      following: 89,
      location: "San Francisco, CA",
      created_at: "2020-01-15T00:00:00Z",
    },
    repos: [
      {
        id: 1,
        name: "awesome-portfolio",
        description: "A modern portfolio website built with Next.js and Tailwind CSS",
        language: "TypeScript",
        stargazers_count: 24,
        forks_count: 8,
        html_url: "#",
      },
      {
        id: 2,
        name: "react-dashboard",
        description: "Admin dashboard with React, Redux, and Material-UI",
        language: "JavaScript",
        stargazers_count: 18,
        forks_count: 5,
        html_url: "#",
      },
    ],
    contributions: [],
  },
  techStack: [
    { technology: "React", category: "Frontend", proficiency: "Advanced" },
    { technology: "Next.js", category: "Frontend", proficiency: "Advanced" },
    { technology: "TypeScript", category: "Frontend", proficiency: "Intermediate" },
    { technology: "Node.js", category: "Backend", proficiency: "Advanced" },
    { technology: "PostgreSQL", category: "Database", proficiency: "Intermediate" },
    { technology: "Docker", category: "DevOps", proficiency: "Intermediate" },
  ],
  projects: [
    {
      title: "E-commerce Platform",
      description:
        "A full-stack e-commerce solution with React, Node.js, and PostgreSQL. Features include user authentication, payment processing, and admin dashboard.",
      githubUrl: "#",
      liveUrl: "#",
      technologies: ["React", "Node.js", "PostgreSQL", "Stripe"],
      isFeatured: true,
    },
    {
      title: "Task Management App",
      description: "A collaborative task management application with real-time updates using Socket.io and React.",
      githubUrl: "#",
      liveUrl: "#",
      technologies: ["React", "Socket.io", "MongoDB", "Express"],
      isFeatured: true,
    },
    {
      title: "Weather Dashboard",
      description:
        "A responsive weather dashboard that displays current conditions and forecasts using OpenWeather API.",
      githubUrl: "#",
      liveUrl: "#",
      technologies: ["Vue.js", "Chart.js", "OpenWeather API"],
      isFeatured: false,
    },
  ],
  contactDetails: {
    email: "alex@example.com",
    linkedin: "https://linkedin.com/in/alexdev",
    github: "https://github.com/alexdev",
    twitter: "https://twitter.com/alexdev",
    instagram: "https://instagram.com/alexdev",
  },
}

export function TemplatePreviewModal({
  templateId,
  isOpen,
  onClose,
  onSelect,
  selectedTemplate,
}: TemplatePreviewModalProps) {
  const template = templateId ? getTemplateById(templateId) : null

  if (!template) return null

  const isSelected = selectedTemplate === templateId

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <DialogTitle className="text-xl">{template.name} Preview</DialogTitle>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Template Features */}
            <div className="flex gap-1">
              {template.features.slice(0, 2).map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>

            {/* Color Scheme Preview */}
            <div className="flex gap-1">
              {Object.entries(template.colorScheme)
                .slice(0, 4)
                .map(([key, color]) => (
                  <div
                    key={key}
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                    title={key}
                  />
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {onSelect && (
                <Button size="sm" variant={isSelected ? "default" : "outline"} onClick={() => onSelect(templateId)}>
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Selected
                    </>
                  ) : (
                    "Select Template"
                  )}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Template Preview */}
        <div className="flex-1 overflow-auto border rounded-lg bg-gray-50">
          <div className="transform scale-75 origin-top-left" style={{ width: "133.33%", height: "133.33%" }}>
            <TemplateRenderer templateId={templateId} data={mockPortfolioData} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
