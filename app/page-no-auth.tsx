"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Code, Palette, Zap, Github, Star, Users, Globe, CheckCircle, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

export default function HomePage() {
    const [typedText, setTypedText] = useState("")
    const [isVisible, setIsVisible] = useState(false)
    const fullText = "Portfolio Generator"

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

    return (
        <div className="min-h-screen relative overflow-hidden">
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
                                <Link href="/auth/login">
                                    <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl group">
                                        Create Your Portfolio
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>

                                <Link href="/auth/login">
                                    <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70 transition-all duration-200">
                                        Sign In
                                    </Button>
                                </Link>
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
                                        Automatically sync with GitHub
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 text-center">
                                        Connect your GitHub account and we'll automatically pull your repositories, contributions, and stats to create a comprehensive portfolio.
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
                                    Link your GitHub account and add your personal details, tech stack, and project information.
                                </p>
                                <div className="flex justify-center space-x-2">
                                    <Badge variant="secondary">GitHub</Badge>
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
                                    <Link href="/auth/login">
                                        <Button size="lg" className="text-lg px-8 py-4 bg-white text-violet-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg">
                                            Start Building Now
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </Link>

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
                                        <Github className="w-4 h-4 mr-1" />
                                        <span>Open Source</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}