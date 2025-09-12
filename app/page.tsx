import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Portfolio Generator</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create a stunning developer portfolio in minutes. Just add your details, choose a template, and let us
            generate your professional portfolio site.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 1</CardTitle>
              <CardDescription>Add Your Details</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">GitHub username, personal info, tech stack, and projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 2</CardTitle>
              <CardDescription>Choose Template</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Select from our collection of professional portfolio templates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 3</CardTitle>
              <CardDescription>Generate Portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Get your complete portfolio site ready to deploy</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Link href="/create">
            <Button size="lg" className="text-lg px-8 py-3">
              Create Your Portfolio
            </Button>
          </Link>
          <div>
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
