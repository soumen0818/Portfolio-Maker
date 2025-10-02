import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PortfolioForm } from "@/components/portfolio-form"
import { Navbar } from "@/components/navbar"
import { Sparkles, Wand2, Palette } from "lucide-react"

export default async function CreatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <div className="py-8 pb-16">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-violet-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-lg animate-pulse delay-500"></div>
          <div className="absolute bottom-40 right-1/3 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          {/* Hero Header */}
          <div className="text-center mb-12 opacity-0 translate-y-5 animate-[fadeInUp_0.8s_ease-out_both]">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full mb-6 animate-bounce">
              <Wand2 className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Your Portfolio
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your developer journey into a stunning portfolio that showcases your skills and projects
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 transform hover:scale-105 transition-all duration-300 hover:bg-white/15">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
                <p className="text-gray-300 text-sm">Intelligent portfolio generation with GitHub integration</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 transform hover:scale-105 transition-all duration-300 hover:bg-white/15 delay-100">
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Beautiful Templates</h3>
                <p className="text-gray-300 text-sm">Modern, responsive designs that make you stand out</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 transform hover:scale-105 transition-all duration-300 hover:bg-white/15 delay-200">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">One-Click Deploy</h3>
                <p className="text-gray-300 text-sm">Publish instantly and share with the world</p>
              </div>
            </div>
          </div>

          {/* Portfolio Form */}
          <div className="opacity-0 translate-y-12 animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
            <PortfolioForm userId={data.user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
