"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { User, Settings, LogOut, Home } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export function Navbar() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const supabase = createClient()

        // Get initial user
        const getUser = async () => {
            const { data, error } = await supabase.auth.getUser()
            if (!error && data.user) {
                setUser(data.user)
            }
            setLoading(false)
        }

        getUser()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null)
        })

        return () => subscription.unsubscribe()
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleProfileClick = () => {
        if (user) {
            setIsDropdownOpen(!isDropdownOpen)
        } else {
            router.push("/auth/login")
        }
    }

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        setIsDropdownOpen(false)
        router.push("/")
    }

    const handleDashboardClick = () => {
        setIsDropdownOpen(false)
        router.push("/protected")
    }

    const handleHomeClick = () => {
        setIsDropdownOpen(false)
        router.push("/")
    }

    if (loading) {
        return (
            <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
                <div className="max-w-9xl mx-auto px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded animate-pulse"></div>
                        <div className="h-6 w-24 bg-white/20 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-8 bg-white/20 rounded-full animate-pulse"></div>
                </div>
            </nav>
        )
    }

    return (
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Site Name */}
                <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    <Image
                        src="/AuraGen logo.png"
                        alt="AuraGen Logo"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                    />
                    <span className="text-3xl font-bold text-white">AuraGen</span>
                </Link>

                {/* Profile Section */}
                <div className="relative" ref={dropdownRef}>
                    {user ? (
                        <>
                            {/* Profile Button */}
                            <button
                                onClick={handleProfileClick}
                                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 rounded-full px-3 py-2 transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-white text-sm hidden md:block">
                                    {user.email?.split('@')[0]}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold">
                                                    {user.email?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                                                <p className="text-xs text-gray-500">Portfolio Creator</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        <button
                                            onClick={handleHomeClick}
                                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <Home className="w-4 h-4 mr-3 text-gray-400" />
                                            Home
                                        </button>
                                        <button
                                            onClick={handleDashboardClick}
                                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 mr-3 text-gray-400" />
                                            Dashboard
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 text-red-500" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={handleProfileClick}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                        >
                            <User className="w-5 h-5 text-white" />
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}