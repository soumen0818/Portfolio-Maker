"use client"

import { MinimalDarkTemplate } from "./templates/minimal-dark"
import { ModernGradientTemplate } from "./templates/modern-gradient"

interface PortfolioData {
  user: any
  githubData: any
  techStack: any[]
  projects: any[]
  contactDetails: any
}

interface TemplateRendererProps {
  templateId: string
  data: PortfolioData
}

export function TemplateRenderer({ templateId, data }: TemplateRendererProps) {
  switch (templateId) {
    case "minimal-dark":
      return <MinimalDarkTemplate data={data} />
    case "modern-gradient":
      return <ModernGradientTemplate data={data} />
    case "creative-portfolio":
      return <MinimalDarkTemplate data={data} /> // Fallback for now
    case "professional-clean":
      return <ModernGradientTemplate data={data} /> // Fallback for now
    case "developer-focused":
      return <MinimalDarkTemplate data={data} /> // Fallback for now
    case "glassmorphism":
      return <ModernGradientTemplate data={data} /> // Fallback for now
    default:
      return <MinimalDarkTemplate data={data} />
  }
}
