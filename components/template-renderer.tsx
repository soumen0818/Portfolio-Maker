"use client"

import { MinimalDarkTemplate } from "./templates/minimal-dark"

interface PortfolioData {
  user: any
  githubData: any
  techStack: Array<{
    technology: string
    category: string
  }>
  projects: any[]
  contactDetails: any
}

interface TemplateRendererProps {
  templateId: string
  data: PortfolioData
}

export function TemplateRenderer({ templateId, data }: TemplateRendererProps) {
  // Only support minimal-dark template (matches soumendas.me design)
  return <MinimalDarkTemplate data={data} />
}
