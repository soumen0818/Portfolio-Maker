import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PortfolioForm } from "@/components/portfolio-form"

export default async function CreatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Portfolio</h1>
          <p className="text-gray-600">Follow the steps below to build your professional developer portfolio</p>
        </div>

        <PortfolioForm userId={data.user.id} />
      </div>
    </div>
  )
}
