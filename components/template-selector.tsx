"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { portfolioTemplates, type TemplateConfig } from "@/lib/templates"
import { TemplatePreviewModal } from "./template-preview-modal"
import { Check, Eye } from "lucide-react"

interface TemplateSelectorProps {
  selectedTemplate: string | null
  onTemplateSelect: (templateId: string) => void
  onPreview?: (templateId: string) => void
}

export function TemplateSelector({ selectedTemplate, onTemplateSelect, onPreview }: TemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateConfig["category"]>("minimal")
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)

  const categories = [
    { id: "minimal", label: "Minimal", description: "Clean and simple designs" },
    { id: "modern", label: "Modern", description: "Contemporary and trendy" },
    { id: "creative", label: "Creative", description: "Bold and artistic" },
    { id: "professional", label: "Professional", description: "Corporate and business-focused" },
  ] as const

  const getTemplatesByCategory = (category: TemplateConfig["category"]) => {
    return portfolioTemplates.filter((template) => template.category === category)
  }

  const handlePreview = (templateId: string) => {
    setPreviewTemplate(templateId)
    onPreview?.(templateId)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Template</h2>
        <p className="text-gray-600">Select a template that best represents your style and personality</p>
      </div>

      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as TemplateConfig["category"])}>
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-sm">
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getTemplatesByCategory(category.id).map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedTemplate === template.id ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
                  }`}
                  onClick={() => onTemplateSelect(template.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {selectedTemplate === template.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Template Preview */}
                    <div
                      className="aspect-video bg-gradient-to-br rounded-lg overflow-hidden relative"
                      style={{
                        background: `linear-gradient(135deg, ${template.colorScheme.background}, ${template.colorScheme.primary}20)`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div
                            className="w-8 h-8 rounded-full mx-auto"
                            style={{ backgroundColor: template.colorScheme.accent }}
                          ></div>
                          <div className="space-y-1">
                            <div
                              className="h-2 w-16 rounded mx-auto"
                              style={{ backgroundColor: template.colorScheme.primary }}
                            ></div>
                            <div
                              className="h-1 w-12 rounded mx-auto"
                              style={{ backgroundColor: template.colorScheme.secondary }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                      {/* Color Scheme */}
                      <div className="flex gap-1 mb-3">
                        {Object.entries(template.colorScheme)
                          .slice(0, 4)
                          .map(([key, color]) => (
                            <div
                              key={key}
                              className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: color }}
                              title={key}
                            />
                          ))}
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.features.slice(0, 2).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {template.features.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.features.length - 2} more
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant={selectedTemplate === template.id ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            onTemplateSelect(template.id)
                          }}
                        >
                          {selectedTemplate === template.id ? "Selected" : "Select"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreview(template.id)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        templateId={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onSelect={onTemplateSelect}
        selectedTemplate={selectedTemplate}
      />
    </div>
  )
}
