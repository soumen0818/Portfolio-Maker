"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, Sparkles } from "lucide-react"
import { PersonalDetailsStep } from "./form-steps/personal-details-step"
import { TechStackStep } from "./form-steps/tech-stack-step"
import { ProjectsStep } from "./form-steps/projects-step"
import { ContactDetailsStep } from "./form-steps/contact-details-step"
import { useRouter } from "next/navigation"

interface PortfolioFormProps {
  userId: string
  existingData?: any
  portfolioId?: string
  isEditing?: boolean
}

export interface FormData {
  name: string
  about: string
  domain: string
  location: string
  resumeUrl: string
  profilePhoto: string
  techStack: string[]
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
  { id: 1, title: "Personal Details", component: PersonalDetailsStep, key: "personal" },
  { id: 2, title: "Tech Stack", component: TechStackStep, key: "techstack" },
  { id: 3, title: "Projects", component: ProjectsStep, key: "projects" },
  { id: 4, title: "Contact Details", component: ContactDetailsStep, key: "contact" },
]

export function PortfolioForm({ userId, existingData, portfolioId, isEditing = false }: PortfolioFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("minimal-dark")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form data with existing data if editing
  const [formData, setFormData] = useState<FormData>({
    name: existingData?.user?.name || "",
    about: existingData?.user?.about || "",
    domain: existingData?.user?.domain || "",
    location: existingData?.user?.location || "",
    resumeUrl: existingData?.user?.resumeUrl || "",
    profilePhoto: existingData?.user?.profilePhoto || "",
    techStack: existingData?.techStack?.map((tech: any) => tech.technology || tech) || [],
    projects: existingData?.projects || [],
    contactDetails: {
      linkedin: existingData?.contactDetails?.linkedin || "",
      github: existingData?.contactDetails?.github || "",
      email: existingData?.contactDetails?.email || "",
      twitter: existingData?.contactDetails?.twitter || "",
      instagram: existingData?.contactDetails?.instagram || "",
    },
  })

  const progress = (currentStep / steps.length) * 100
  const CurrentStepComponent = steps.find((step) => step.id === currentStep)?.component

  const handleNext = async () => {
    setError(null)

    // Save current step data before moving to next
    if (currentStep < steps.length) {
      const currentStepKey = steps[currentStep - 1].key
      if (currentStepKey !== "template") {
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
    // Template is automatically set to minimal-dark

    setIsGenerating(true)
    setError(null)

    try {
      // Save contact details first
      await saveStepData("contact")

      // Determine if we're updating or creating
      const endpoint = isEditing ? "/api/portfolio/update" : "/api/portfolio/generate"
      const requestBody = isEditing
        ? {
          portfolioId,
          templateId: selectedTemplate,
        }
        : {
          templateId: selectedTemplate,
        }

      // Generate or update portfolio
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Failed to ${isEditing ? 'update' : 'generate'} portfolio`)
      }

      const result = await response.json()

      // Redirect to preview page with the portfolio ID
      const portfolioIdToUse = isEditing ? portfolioId : result.portfolio.id
      router.push(`/portfolio/preview/${portfolioIdToUse}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'generate'} portfolio`)
    } finally {
      setIsGenerating(false)
    }
  }

  const isLastStep = currentStep === steps.length
  const canProceed = true // Always can proceed since we have default template

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Progress Section */}
      <div className="mb-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center text-sm text-gray-300 mb-4">
            <span className="font-medium">
              Step {currentStep} of {steps.length}
            </span>
            <span className="bg-violet-600/20 px-3 py-1 rounded-full text-violet-300 font-medium">
              {Math.round(progress)}% Complete
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation Dots */}
      <div className="flex justify-center mb-10">
        <div className="flex space-x-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-4 shadow-xl">
          {steps.map((step, index) => (
            <div key={step.id} className="relative group">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 transform hover:scale-110 ${step.id === currentStep
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/50 scale-110"
                  : step.id < currentStep
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                    : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50"
                  }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="w-6 h-6 animate-bounce" />
                ) : (
                  <span className="transition-transform duration-300">
                    {step.id}
                  </span>
                )}
              </div>

              {/* Step connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-6 left-12 w-8 h-0.5 transition-all duration-500 ${step.id < currentStep
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gray-700/50"
                    }`}
                ></div>
              )}

              {/* Tooltip */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-gray-900/90 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap border border-gray-700">
                  {step.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-8 animate-pulse">
          <Alert className="bg-red-900/20 border-red-500/50 backdrop-blur-md" variant="destructive">
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Current Step Card */}
      <div className="mb-8 opacity-0 translate-y-7 animate-[fadeInUp_0.6s_ease-out_both]">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-violet-500/10">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">{currentStep}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {steps.find((step) => step.id === currentStep)?.title}
                </h2>
                <p className="text-gray-300 text-sm">
                  {currentStep === 1 && "Tell us about yourself and your developer journey"}
                  {currentStep === 2 && "Showcase your technical skills and expertise"}
                  {currentStep === 3 && "Highlight your best 4 projects and achievements"}
                  {currentStep === 4 && "Make it easy for others to connect with you"}
                </p>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-8">
            {CurrentStepComponent && (
              <CurrentStepComponent formData={formData} updateFormData={updateFormData} userId={userId} />
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </Button>

        <div className="flex-1 flex justify-center">
          <div className="text-sm text-gray-300 font-medium">
            Step {currentStep} of {steps.length}
          </div>
        </div>

        {isLastStep ? (
          <Button
            onClick={handleGeneratePortfolio}
            disabled={!canProceed || isGenerating}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[180px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="animate-pulse">Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {isEditing ? 'Update Portfolio' : 'Generate Portfolio'}
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Next Step
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  )
}
