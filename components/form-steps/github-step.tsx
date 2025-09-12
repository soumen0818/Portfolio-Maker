"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Github, Star, GitFork } from "lucide-react"
import type { FormData } from "../portfolio-form"

interface GitHubStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  userId: string
}

interface GitHubPreview {
  profile: any
  repos: any[]
  contributions: any[]
}

export function GitHubStep({ formData, updateFormData }: GitHubStepProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [githubPreview, setGithubPreview] = useState<GitHubPreview | null>(null)

  const handleUsernameChange = (username: string) => {
    updateFormData({ githubUsername: username })
    setValidationMessage("")
    setIsValid(false)
    setGithubPreview(null)
  }

  const validateGitHubUsername = async () => {
    if (!formData.githubUsername) return

    setIsValidating(true)
    try {
      const response = await fetch(`/api/github/validate/${formData.githubUsername}`)
      const data = await response.json()

      if (data.valid) {
        setValidationMessage("✓ GitHub username found!")
        setIsValid(true)
      } else {
        setValidationMessage("❌ GitHub username not found")
        setIsValid(false)
      }
    } catch (error) {
      setValidationMessage("❌ Error validating username")
      setIsValid(false)
    } finally {
      setIsValidating(false)
    }
  }

  const fetchGitHubData = async () => {
    if (!formData.githubUsername || !isValid) return

    setIsFetching(true)
    try {
      const response = await fetch("/api/portfolio/github-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ githubUsername: formData.githubUsername }),
      })

      const result = await response.json()

      if (result.success) {
        setGithubPreview(result.data)
      } else {
        setValidationMessage("❌ Failed to fetch GitHub data")
      }
    } catch (error) {
      setValidationMessage("❌ Error fetching GitHub data")
    } finally {
      setIsFetching(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="github-username">GitHub Username</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="github-username"
            placeholder="Enter your GitHub username"
            value={formData.githubUsername}
            onChange={(e) => handleUsernameChange(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={validateGitHubUsername}
            disabled={!formData.githubUsername || isValidating}
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              "Validate"
            )}
          </Button>
        </div>
      </div>

      {validationMessage && (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            {validationMessage}
          </AlertDescription>
        </Alert>
      )}

      {isValid && !githubPreview && (
        <Button onClick={fetchGitHubData} disabled={isFetching} className="w-full">
          {isFetching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Fetching GitHub Data...
            </>
          ) : (
            <>
              <Github className="w-4 h-4 mr-2" />
              Fetch GitHub Data
            </>
          )}
        </Button>
      )}

      {githubPreview && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="w-5 h-5" />
                GitHub Profile Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <img
                  src={githubPreview.profile.avatar_url || "/placeholder.svg"}
                  alt={githubPreview.profile.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{githubPreview.profile.name}</h3>
                  <p className="text-sm text-gray-600">@{githubPreview.profile.login}</p>
                  {githubPreview.profile.bio && <p className="text-sm mt-2">{githubPreview.profile.bio}</p>}
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>{githubPreview.profile.public_repos} repos</span>
                    <span>{githubPreview.profile.followers} followers</span>
                    <span>{githubPreview.profile.following} following</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {githubPreview.repos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Repositories ({githubPreview.repos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {githubPreview.repos.slice(0, 3).map((repo) => (
                    <div key={repo.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{repo.name}</h4>
                          {repo.description && <p className="text-xs text-gray-600 mt-1">{repo.description}</p>}
                          <div className="flex items-center gap-3 mt-2">
                            {repo.language && (
                              <Badge variant="secondary" className="text-xs">
                                {repo.language}
                              </Badge>
                            )}
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Star className="w-3 h-3" />
                              {repo.stargazers_count}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <GitFork className="w-3 h-3" />
                              {repo.forks_count}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p>We'll use your GitHub username to:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Fetch your pinned repositories</li>
          <li>Display your contribution graph</li>
          <li>Show your GitHub profile information</li>
        </ul>
      </div>
    </div>
  )
}
