// Template system for portfolio generation
export interface TemplateConfig {
  id: string
  name: string
  description: string
  preview: string
  category: "minimal" | "modern" | "creative" | "professional"
  features: string[]
  colorScheme: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
}

export const portfolioTemplates: TemplateConfig[] = [
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    description: "Clean, dark theme with focus on content and readability (matches soumendas.me design)",
    preview: "/templates/minimal-dark-preview.png",
    category: "minimal",
    features: ["Dark theme", "Clean typography", "Minimal animations", "Mobile responsive"],
    colorScheme: {
      primary: "#ffffff",
      secondary: "#a1a1aa",
      accent: "#3b82f6",
      background: "#0a0a0a",
      text: "#ffffff",
    },
  },
]

export function getTemplateById(id: string): TemplateConfig | undefined {
  return portfolioTemplates.find((template) => template.id === id)
}

export function getTemplatesByCategory(category: TemplateConfig["category"]): TemplateConfig[] {
  return portfolioTemplates.filter((template) => template.category === category)
}
