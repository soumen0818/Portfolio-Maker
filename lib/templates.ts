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
    description: "Clean, dark theme with focus on content and readability",
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
  {
    id: "modern-gradient",
    name: "Modern Gradient",
    description: "Contemporary design with gradient backgrounds and smooth animations",
    preview: "/templates/modern-gradient-preview.png",
    category: "modern",
    features: ["Gradient backgrounds", "Smooth animations", "Modern layout", "Interactive elements"],
    colorScheme: {
      primary: "#1f2937",
      secondary: "#6b7280",
      accent: "#8b5cf6",
      background: "#f9fafb",
      text: "#111827",
    },
  },
  {
    id: "creative-portfolio",
    name: "Creative Portfolio",
    description: "Bold and creative design perfect for designers and artists",
    preview: "/templates/creative-portfolio-preview.png",
    category: "creative",
    features: ["Bold typography", "Creative layouts", "Image galleries", "Unique animations"],
    colorScheme: {
      primary: "#ec4899",
      secondary: "#f97316",
      accent: "#06b6d4",
      background: "#fef7ff",
      text: "#1f2937",
    },
  },
  {
    id: "professional-clean",
    name: "Professional Clean",
    description: "Professional and corporate-friendly design",
    preview: "/templates/professional-clean-preview.png",
    category: "professional",
    features: ["Corporate design", "Professional layout", "Clean sections", "Business focused"],
    colorScheme: {
      primary: "#1e40af",
      secondary: "#64748b",
      accent: "#059669",
      background: "#ffffff",
      text: "#1f2937",
    },
  },
  {
    id: "developer-focused",
    name: "Developer Focused",
    description: "Code-centric design with terminal aesthetics",
    preview: "/templates/developer-focused-preview.png",
    category: "minimal",
    features: ["Code syntax highlighting", "Terminal theme", "Tech stack focus", "GitHub integration"],
    colorScheme: {
      primary: "#00ff00",
      secondary: "#888888",
      accent: "#ff6b6b",
      background: "#1a1a1a",
      text: "#ffffff",
    },
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    description: "Modern glass-like design with blur effects",
    preview: "/templates/glassmorphism-preview.png",
    category: "modern",
    features: ["Glass effects", "Blur backgrounds", "Modern aesthetics", "Layered design"],
    colorScheme: {
      primary: "#ffffff",
      secondary: "#e5e7eb",
      accent: "#3b82f6",
      background: "#f3f4f6",
      text: "#1f2937",
    },
  },
]

export function getTemplateById(id: string): TemplateConfig | undefined {
  return portfolioTemplates.find((template) => template.id === id)
}

export function getTemplatesByCategory(category: TemplateConfig["category"]): TemplateConfig[] {
  return portfolioTemplates.filter((template) => template.category === category)
}
