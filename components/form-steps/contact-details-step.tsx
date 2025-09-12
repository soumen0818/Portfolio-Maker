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
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={formData.contactDetails.email}
          onChange={(e) => updateContactDetail("email", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="linkedin">LinkedIn URL</Label>
        <Input
          id="linkedin"
          type="url"
          placeholder="https://linkedin.com/in/yourprofile"
          value={formData.contactDetails.linkedin}
          onChange={(e) => updateContactDetail("linkedin", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="github">GitHub URL</Label>
        <Input
          id="github"
          type="url"
          placeholder="https://github.com/yourusername"
          value={formData.contactDetails.github}
          onChange={(e) => updateContactDetail("github", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="twitter">Twitter/X URL</Label>
        <Input
          id="twitter"
          type="url"
          placeholder="https://x.com/yourusername"
          value={formData.contactDetails.twitter}
          onChange={(e) => updateContactDetail("twitter", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="instagram">Instagram URL</Label>
        <Input
          id="instagram"
          type="url"
          placeholder="https://instagram.com/yourusername"
          value={formData.contactDetails.instagram}
          onChange={(e) => updateContactDetail("instagram", e.target.value)}
        />
      </div>

      <div className="text-sm text-gray-600 mt-4">
        <p>
          These contact details will be displayed on your portfolio for potential employers and collaborators to reach
          you.
        </p>
      </div>
    </div>
  )
}
