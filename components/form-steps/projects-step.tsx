"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import type { FormData } from "../portfolio-form"

interface ProjectsStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  userId: string
}

export function ProjectsStep({ formData, updateFormData }: ProjectsStepProps) {
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    githubUrl: "",
    liveUrl: "",
    technologies: [] as string[],
  })
  const [newTechnology, setNewTechnology] = useState("")

  const addTechnology = () => {
    if (!newTechnology || newProject.technologies.includes(newTechnology)) return

    setNewProject((prev) => ({
      ...prev,
      technologies: [...prev.technologies, newTechnology],
    }))
    setNewTechnology("")
  }

  const removeTechnology = (tech: string) => {
    setNewProject((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }))
  }

  const addProject = () => {
    if (!newProject.title || !newProject.description) return

    const updatedProjects = [...formData.projects, newProject]
    updateFormData({ projects: updatedProjects })

    setNewProject({
      title: "",
      description: "",
      githubUrl: "",
      liveUrl: "",
      technologies: [],
    })
  }

  const removeProject = (index: number) => {
    const updatedProjects = formData.projects.filter((_, i) => i !== index)
    updateFormData({ projects: updatedProjects })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="project-title">Project Title *</Label>
            <Input
              id="project-title"
              placeholder="Enter project title"
              value={newProject.title}
              onChange={(e) => setNewProject((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="project-description">Description *</Label>
            <Textarea
              id="project-description"
              placeholder="Describe your project, what it does, and what makes it special..."
              value={newProject.description}
              onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="github-url">GitHub URL</Label>
              <Input
                id="github-url"
                type="url"
                placeholder="https://github.com/username/repo"
                value={newProject.githubUrl}
                onChange={(e) => setNewProject((prev) => ({ ...prev, githubUrl: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="live-url">Live URL</Label>
              <Input
                id="live-url"
                type="url"
                placeholder="https://your-project.com"
                value={newProject.liveUrl}
                onChange={(e) => setNewProject((prev) => ({ ...prev, liveUrl: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Technologies Used</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add technology"
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTechnology()}
              />
              <Button type="button" onClick={addTechnology} size="sm">
                <Plus size={16} />
              </Button>
            </div>
            {newProject.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newProject.technologies.map((tech) => (
                  <Badge key={tech} variant="outline" className="flex items-center gap-1">
                    {tech}
                    <button onClick={() => removeTechnology(tech)}>
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={addProject}
            disabled={!newProject.title || !newProject.description}
            className="w-full"
          >
            Add Project
          </Button>
        </CardContent>
      </Card>

      {formData.projects.length > 0 && (
        <div>
          <Label className="text-lg">Your Projects ({formData.projects.length})</Label>
          <div className="space-y-4 mt-2">
            {formData.projects.map((project, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{project.title}</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeProject(index)}>
                      <X size={16} />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
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
      )}
    </div>
  )
}
