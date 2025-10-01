"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { FormData } from "../portfolio-form"

interface TechStackStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  userId: string
}

export function TechStackStep({ formData, updateFormData }: TechStackStepProps) {
  const [newTech, setNewTech] = useState("")

  const addTechnology = () => {
    if (!newTech.trim() || formData.techStack.length >= 10) return

    const updatedTechStack = [
      ...formData.techStack,
      newTech.trim(),
    ]

    updateFormData({ techStack: updatedTechStack })
    setNewTech("")
  }

  const removeTechnology = (index: number) => {
    const updatedTechStack = formData.techStack.filter((_, i) => i !== index)
    updateFormData({ techStack: updatedTechStack })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTechnology()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="technology" className="text-white font-medium">
            Technology/Skill ({formData.techStack.length}/10)
          </Label>
          <Input
            id="technology"
            placeholder="e.g., React, Node.js, Python, Docker"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-violet-400/20"
            disabled={formData.techStack.length >= 10}
          />
        </div>
        <Button
          type="button"
          onClick={addTechnology}
          disabled={!newTech.trim() || formData.techStack.length >= 10}
          className="self-end bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white disabled:opacity-50"
        >
          Add
        </Button>
      </div>

      {formData.techStack.length >= 10 && (
        <p className="text-yellow-400 text-sm">Maximum 10 technologies allowed</p>
      )}

      {formData.techStack.length > 0 && (
        <div>
          <Label className="text-white font-medium">Your Tech Stack</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.techStack.map((tech, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-violet-600/20 text-violet-300 border-violet-500/30 hover:bg-violet-600/30">
                {tech}
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
