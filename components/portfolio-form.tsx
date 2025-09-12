"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle } from "lucide-react"
import { GitHubStep } from "./form-steps/github-step"
import { PersonalDetailsStep } from "./form-steps/personal-details-step"
import { TechStackStep } from "./form-steps/tech-stack-step"
import { ProjectsStep } from "./form-steps/projects-step"
import { ContactDetailsStep } from "./form-steps/contact-details-step"
import { TemplateSelector } from "./template-selector"
import { useRouter } from "next/navigation"

interface PortfolioFormProps {
  userId: string
}

export interface FormData {
  githubUsername: string
  name: string
  about: string
  resumeUrl: string
  techStack: Array<{ technology: string; category: string; proficiency: string }>
  projects: Array<{ title: string; description: string; githubUrl: string; liveUrl: string; technologies: string[] }>
  contactDetails: {
    linkedin: string
    github: string
    email: string
    twitter: string
    instagram: string
  }
}

const steps = [
  { id: 1, title: "GitHub Username", component: GitHubStep, key: "github" },
  { id: 2, title: "Personal Details", component: PersonalDetailsStep, key: "personal" },
  { id: 3, title: "Tech Stack", component: TechStackStep, key: "techstack" },
  { id: 4, title: "Projects", component: ProjectsStep, key: "projects" },
  { id: 5, title: "Contact Details", component: ContactDetailsStep, key: "contact" },
  { id: 6, title: "Choose Template", component: null, key: "template" },
]

export function PortfolioForm({ userId }: PortfolioFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    githubUsername: "",
    name: "",
    about: "",
    resumeUrl: "",
    techStack: [],
    projects: [],
    contactDetails: {
      linkedin: "",
      github: "",
      email: "",
      twitter: "",
      instagram: "",
    },
  })

  const progress = (currentStep / steps.length) * 100
  const CurrentStepComponent = steps.find((step) => step.id === currentStep)?.component

  const handleNext = async () => {
    setError(null)

    // Save current step data before moving to next
    if (currentStep < steps.length) {
      const currentStepKey = steps[currentStep - 1].key
      if (currentStepKey !== "github" && currentStepKey !== "template") {
        try {
          await saveStepData(currentStepKey)
        } catch (error) {
          setError("Failed to save data. Please try again.")
          return
        }
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const saveStepData = async (step: string) => {
    const response = await fetch("/api/portfolio/save-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        step,
        data: {
          ...formData,
          githubUsername: formData.githubUsername,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to save data")
    }
  }

  const updateFormData = (stepData: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }))
  }

  const handleGeneratePortfolio = async () => {
    if (!selectedTemplate) {
      setError("Please select a template")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Save contact details first
      await saveStepData("contact")

      // Generate portfolio
      const response = await fetch("/api/portfolio/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to generate portfolio")
      }

      const result = await response.json()

      // Redirect to preview page
      router.push(`/portfolio/preview/${result.portfolio.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to generate portfolio")
    } finally {
      setIsGenerating(false)
    }
  }

  const isLastStep = currentStep === steps.length
  const canProceed = currentStep === steps.length ? selectedTemplate : true

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Step {currentStep} of {steps.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.id === currentStep
                  ? "bg-blue-600 text-white"
                  : step.id < currentStep
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {step.id < currentStep ? <CheckCircle className="w-4 h-4" /> : step.id}
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle>{steps.find((step) => step.id === currentStep)?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 6 ? (
            <TemplateSelector selectedTemplate={selectedTemplate} onTemplateSelect={setSelectedTemplate} />
          ) : (
            CurrentStepComponent && (
              <CurrentStepComponent formData={formData} updateFormData={updateFormData} userId={userId} />
            )
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
          Previous
        </Button>

        {isLastStep ? (
          <Button onClick={handleGeneratePortfolio} disabled={!canProceed || isGenerating} className="min-w-[140px]">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Portfolio"
            )}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!canProceed}>
            Next
          </Button>
        )}
      </div>
    </div>
  )
}
