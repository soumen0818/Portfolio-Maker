"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { FormData } from "../portfolio-form"

interface TechStackStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  userId: string
}

const categories = ["Frontend", "Backend", "Database", "DevOps", "Mobile", "Tools", "Other"]

const proficiencyLevels = ["Beginner", "Intermediate", "Advanced"]

export function TechStackStep({ formData, updateFormData }: TechStackStepProps) {
  const [newTech, setNewTech] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newProficiency, setNewProficiency] = useState("Intermediate")

  const addTechnology = () => {
    if (!newTech || !newCategory) return

    const updatedTechStack = [
      ...formData.techStack,
      {
        technology: newTech,
        category: newCategory,
        proficiency: newProficiency,
      },
    ]

    updateFormData({ techStack: updatedTechStack })
    setNewTech("")
    setNewCategory("")
    setNewProficiency("Intermediate")
  }

  const removeTechnology = (index: number) => {
    const updatedTechStack = formData.techStack.filter((_, i) => i !== index)
    updateFormData({ techStack: updatedTechStack })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="technology" className="text-white font-medium">Technology</Label>
          <Input
            id="technology"
            placeholder="e.g., React, Node.js, Python"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-violet-400/20"
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-white font-medium">Category</Label>
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-violet-400 focus:ring-violet-400/20">
              <SelectValue placeholder="Select category" className="text-gray-400" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="text-white hover:bg-gray-700">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="proficiency" className="text-white font-medium">Proficiency</Label>
          <Select value={newProficiency} onValueChange={setNewProficiency}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-violet-400 focus:ring-violet-400/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {proficiencyLevels.map((level) => (
                <SelectItem key={level} value={level} className="text-white hover:bg-gray-700">
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="button"
        onClick={addTechnology}
        disabled={!newTech || !newCategory}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white disabled:opacity-50"
      >
        Add Technology
      </Button>

      {formData.techStack.length > 0 && (
        <div>
          <Label className="text-white font-medium">Your Tech Stack</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.techStack.map((tech, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-violet-600/20 text-violet-300 border-violet-500/30 hover:bg-violet-600/30">
                {tech.technology} ({tech.category})
                <button onClick={() => removeTechnology(index)} className="ml-1 hover:text-red-400 transition-colors">
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
