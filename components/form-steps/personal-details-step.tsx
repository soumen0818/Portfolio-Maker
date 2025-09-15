"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { FormData } from "../portfolio-form"

interface PersonalDetailsStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  userId: string
}

export function PersonalDetailsStep({ formData, updateFormData }: PersonalDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-white font-medium">Full Name *</Label>
        <Input
          id="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-violet-400/20"
        />
      </div>

      <div>
        <Label htmlFor="about" className="text-white font-medium">About You *</Label>
        <Textarea
          id="about"
          placeholder="Tell us about yourself, your experience, and what you're passionate about..."
          value={formData.about}
          onChange={(e) => updateFormData({ about: e.target.value })}
          rows={4}
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-violet-400/20"
        />
      </div>

      <div>
        <Label htmlFor="resume" className="text-white font-medium">Resume URL (Optional)</Label>
        <Input
          id="resume"
          type="url"
          placeholder="https://example.com/your-resume.pdf"
          value={formData.resumeUrl}
          onChange={(e) => updateFormData({ resumeUrl: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-violet-400/20"
        />
        <p className="text-sm text-gray-300 mt-1">Link to your resume (Google Drive, Dropbox, or any public URL)</p>
      </div>
    </div>
  )
}
