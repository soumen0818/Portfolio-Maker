"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import type { FormData } from "../portfolio-form"

interface PersonalDetailsStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  userId: string
}

export function PersonalDetailsStep({ formData, updateFormData }: PersonalDetailsStepProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, JPEG, PNG, or SVG)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      // Convert to base64 for now - in production, you'd upload to a cloud service
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64String = e.target?.result as string
        updateFormData({ profilePhoto: base64String })
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file. Please try again.')
      setIsUploading(false)
    }
  }

  const removePhoto = () => {
    updateFormData({ profilePhoto: "" })
  }

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
        <Label htmlFor="domain" className="text-white font-medium">Domain/Specialization *</Label>
        <Input
          id="domain"
          placeholder="e.g., Web Developer, ML Engineer, DevOps Engineer"
          value={formData.domain}
          onChange={(e) => updateFormData({ domain: e.target.value })}
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-violet-400/20"
        />
      </div>

      <div>
        <Label htmlFor="location" className="text-white font-medium">Location</Label>
        <Input
          id="location"
          placeholder="e.g., New York, USA or Remote"
          value={formData.location}
          onChange={(e) => updateFormData({ location: e.target.value })}
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
        <Label className="text-white font-medium">Profile Photo</Label>
        <div className="mt-2">
          {formData.profilePhoto ? (
            <div className="flex items-center gap-4">
              <img
                src={formData.profilePhoto}
                alt="Profile preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-violet-400"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removePhoto}
                className="text-red-400 border-red-400 hover:bg-red-400/10"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-300 mb-2">Upload your profile photo</p>
              <p className="text-sm text-gray-400 mb-4">JPG, JPEG, PNG, or SVG (max 5MB)</p>
              <input
                type="file"
                id="profilePhoto"
                accept=".jpg,.jpeg,.png,.svg"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isUploading}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <label htmlFor="profilePhoto" className="cursor-pointer">
                  {isUploading ? "Uploading..." : "Choose File"}
                </label>
              </Button>
            </div>
          )}
        </div>
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
