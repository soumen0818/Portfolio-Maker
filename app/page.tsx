"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Code, Palette, Zap, Star, Users, Globe, CheckCircle, Sparkles, Menu, X, Twitter, Linkedin, Mail, Heart, User as UserIcon, LogOut, Settings, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function HomePage() {
  const [typedText, setTypedText] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const fullText = "Portfolio Generator"

  useEffect(() => {
    // Check authentication status with better error handling
    const checkUser = async () => {
      console.log('Checking user authentication...')
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        console.log('Auth result - User:', user, 'Error:', error)
        if (error) {
          console.warn('Auth check failed:', error.message)
          setAuthError(true)
          setUser(null)
        } else {
          console.log('User state:', user ? 'Authenticated' : 'Not authenticated')
          setUser(user)
          setAuthError(false)
        }
      } catch (error) {
        console.warn('Network or connection error:', error)
        setAuthError(true)
        setUser(null)
      } finally {
        setLoading(false)
        console.log('Auth check completed. Loading set to false.')
      }
    }

    checkUser()

    // Listen for auth changes with error handling
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, 'User:', session?.user)
        setUser(session?.user ?? null)
        setAuthError(false)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.warn('Auth listener setup failed:', error)
      setAuthError(true)
      setLoading(false)
    }
  }, [supabase.auth])

  useEffect(() => {
    setIsVisible(true)
    let i = 0
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [])

  const handleCreatePortfolio = () => {
    if (user) {
      // User is logged in, redirect to create page
      console.log('User is logged in, redirecting to create page')
      router.push('/create')
    } else {
      // User is not logged in, redirect to sign-up
      console.log('User not logged in, redirecting to sign-up page')
      router.push('/auth/sign-up')
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error logging out:', error)
      } else {
        setUser(null)
        setProfileDropdownOpen(false)
        router.push('/')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Function to get user avatar initials
  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/AuraGen logo.png"
                  alt="AuraGen Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  AuraGen
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                /* Profile Dropdown for logged in users */
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 bg-white/50 hover:bg-white/70 px-3 py-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.email ? getUserInitials(user.email) : <UserIcon className="w-4 h-4" />}
                    </div>
                    <span className="text-sm text-gray-700 max-w-32 truncate">{user.email}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-white/30 rounded-lg shadow-lg z-50">
                      <div className="p-4 border-b border-gray-200/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {user.email ? getUserInitials(user.email) : <UserIcon className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.email}</p>
                            <p className="text-xs text-gray-500">Portfolio Creator</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/protected"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Auth buttons for non-logged in users */
                <>
                  <Link href="/auth/sign-up">
                    <Button variant="outline" size="sm" className="bg-white/50 border-white/30 hover:bg-white/70">
                      Sign Up
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white/90 backdrop-blur-md rounded-lg mt-2 border border-white/20">
                {user ? (
                  /* Profile section for logged in users */
                  <>
                    <div className="flex items-center space-x-3 p-3 border-b border-gray-200/50">
                      <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user.email ? getUserInitials(user.email) : <UserIcon className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500">Portfolio Creator</p>
                      </div>
                    </div>
                    <Link href="/protected" className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-3" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50/50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </Button>
                  </>
                ) : (
                  /* Auth buttons for non-logged in users */
                  <>
                    <Link href="/auth/sign-up" className="block">
                      <Button variant="outline" size="sm" className="w-full bg-white/50 border-white/30 hover:bg-white/70">
                        Sign Up
                      </Button>
                    </Link>
                    <Link href="/auth/login" className="block">
                      <Button size="sm" className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-indigo-50 to-cyan-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)]" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className={`mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Badge variant="secondary" className="mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30">
                <Sparkles className="w-4 h-4 mr-2" />
                New v2.0 Released
              </Badge>

              <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight">
                {typedText}
                <span className="animate-pulse">|</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transform your <span className="font-semibold text-violet-600">development journey</span> into a
                <span className="font-semibold text-purple-600"> stunning portfolio</span> in minutes.
                No coding required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button
                  size="lg"
                  onClick={handleCreatePortfolio}
                  disabled={loading}
                  className="text-lg px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl group"
                >
                  {loading ? "Loading..." : "Create Your Portfolio"}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                {!user && !loading && (
                  <Link href="/auth/login">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70 transition-all duration-200">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Section */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-violet-600 mb-2">50K+</div>
                <div className="text-gray-600">Portfolios Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600">Happy Developers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">15+</div>
                <div className="text-gray-600">Premium Templates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">99%</div>
                <div className="text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built by developers, for developers. Get everything you need to showcase your skills professionally.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Smart Integration</CardTitle>
                  <CardDescription className="text-gray-600">
                    Intelligent portfolio building
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Our smart system helps you create a comprehensive portfolio with your personal details, projects, and skills in a beautiful format.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Beautiful Templates</CardTitle>
                  <CardDescription className="text-gray-600">
                    Professional designs that impress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Choose from our curated collection of modern, responsive templates designed specifically for developers and creatives.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Lightning Fast</CardTitle>
                  <CardDescription className="text-gray-600">
                    Deploy in minutes, not hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Generate and deploy your portfolio in under 5 minutes. No complex setup, no hosting headaches.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 px-4 bg-white/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Three Simple Steps
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From signup to showcase in just three easy steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-gray-800" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect & Configure</h3>
                <p className="text-gray-600 mb-6">
                  Add your personal details, tech stack, and project information to create your professional portfolio.
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge variant="secondary">Personal Info</Badge>
                  <Badge variant="secondary">Projects</Badge>
                </div>
              </div>

              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Palette className="w-5 h-5 text-gray-800" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Style</h3>
                <p className="text-gray-600 mb-6">
                  Select from our premium collection of professional portfolio templates that match your personality.
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge variant="secondary">Modern</Badge>
                  <Badge variant="secondary">Minimal</Badge>
                  <Badge variant="secondary">Creative</Badge>
                </div>
              </div>

              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-gray-800" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Generate & Deploy</h3>
                <p className="text-gray-600 mb-6">
                  Hit generate and watch your professional portfolio come to life, ready to impress employers.
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge variant="secondary">Generate</Badge>
                  <Badge variant="secondary">Deploy</Badge>
                  <Badge variant="secondary">Share</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Stand Out?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of developers who've transformed their careers with our platform
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <Button
                    size="lg"
                    onClick={handleCreatePortfolio}
                    disabled={loading}
                    className="text-lg px-8 py-4 bg-white text-violet-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    {loading ? "Loading..." : "Start Building Now"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>

                  <p className="text-sm opacity-80">No credit card required • Free forever plan</p>
                </div>

                <div className="flex justify-center items-center space-x-6 text-sm opacity-80">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    <span>4.9/5 Rating</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>50K+ Users</span>
                  </div>
                  <div className="flex items-center">
                    <Code className="w-4 h-4 mr-1" />
                    <span>Developer Friendly</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-white/20 backdrop-blur-sm border-t border-white/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Company Info */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    AuraGen
                  </span>
                </div>
                <p className="text-gray-600 mb-4 max-w-md">
                  Create stunning developer portfolios in minutes. Transform your coding journey into a professional showcase that stands out.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-500 hover:text-violet-600 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-500 hover:text-violet-600 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="mailto:contact@auragen.dev" className="text-gray-500 hover:text-violet-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Product Links */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">Templates</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">Features</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">Pricing</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">Examples</a></li>
                </ul>
              </div>

              {/* Support Links */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">Contact Us</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">Community</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/30">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-600 text-sm mb-4 md:mb-0">
                  © 2025 AuraGen. All rights reserved.
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <span>Made with</span>
                  <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" />
                  <span>by developers, for developers</span>
                </div>
                <div className="flex space-x-6 text-sm text-gray-600 mt-4 md:mt-0">
                  <a href="#" className="hover:text-violet-600 transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-violet-600 transition-colors">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
