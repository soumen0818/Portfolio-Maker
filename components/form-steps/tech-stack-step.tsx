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
          <Label htmlFor="technology">Technology</Label>
          <Input
            id="technology"
            placeholder="e.g., React, Node.js, Python"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="proficiency">Proficiency</Label>
          <Select value={newProficiency} onValueChange={setNewProficiency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {proficiencyLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="button" onClick={addTechnology} disabled={!newTech || !newCategory} className="w-full">
        Add Technology
      </Button>

      {formData.techStack.length > 0 && (
        <div>
          <Label>Your Tech Stack</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.techStack.map((tech, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tech.technology} ({tech.category})
                <button onClick={() => removeTechnology(index)} className="ml-1 hover:text-red-500">
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
