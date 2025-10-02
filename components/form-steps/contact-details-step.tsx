"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormData } from "../portfolio-form"

interface ContactDetailsStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  userId: string
}

export function ContactDetailsStep({ formData, updateFormData }: ContactDetailsStepProps) {
  const updateContactDetail = (field: keyof FormData["contactDetails"], value: string) => {
    updateFormData({
      contactDetails: {
        ...formData.contactDetails,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={formData.contactDetails.email}
          onChange={(e) => updateContactDetail("email", e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-violet-400/20"
        />
      </div>

      <div>
        <Label htmlFor="linkedin" className="text-white font-medium">LinkedIn URL</Label>
        <Input
          id="linkedin"
          type="url"
          placeholder="https://linkedin.com/in/yourprofile"
          value={formData.contactDetails.linkedin}
          onChange={(e) => updateContactDetail("linkedin", e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-violet-400/20"
        />
      </div>

      <div>
        <Label htmlFor="github" className="text-white font-medium">GitHub URL</Label>
        <Input
          id="github"
          type="url"
          placeholder="https://github.com/yourusername"
          value={formData.contactDetails.github}
          onChange={(e) => updateContactDetail("github", e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-violet-400/20"
        />
      </div>

      <div>
        <Label htmlFor="twitter" className="text-white font-medium">Twitter/X URL</Label>
        <Input
          id="twitter"
          type="url"
          placeholder="https://x.com/yourusername"
          value={formData.contactDetails.twitter}
          onChange={(e) => updateContactDetail("twitter", e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-violet-400/20"
        />
      </div>

      <div>
        <Label htmlFor="instagram" className="text-white font-medium">Instagram URL</Label>
        <Input
          id="instagram"
          type="url"
          placeholder="https://instagram.com/yourusername"
          value={formData.contactDetails.instagram}
          onChange={(e) => updateContactDetail("instagram", e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-violet-400/20"
        />
      </div>

      <div className="text-sm text-gray-300 mt-4">
        <p>
          These contact details will be displayed on your portfolio for potential employers and collaborators to reach
          you.
        </p>
      </div>
    </div>
  )
}
