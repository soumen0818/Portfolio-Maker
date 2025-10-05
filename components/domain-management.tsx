"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Globe, Search, ShoppingCart, ExternalLink, Settings, CheckCircle, Clock, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DomainSettings } from "./domain-settings"

interface Domain {
    id: string
    tld: string
    price_inr: number
    renewal_price_inr: number
    is_available: boolean
}

interface UserDomain {
    id: string
    domain_name: string
    tld: string
    is_active: boolean
    is_verified: boolean
    expiry_date: string
    portfolio_id?: string
}

interface Portfolio {
    id: string
    template_id: string
    is_published: boolean
}

interface DomainManagementProps {
    portfolios: Portfolio[]
}

export function DomainManagement({ portfolios }: DomainManagementProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [domains, setDomains] = useState<Domain[]>([])
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [userDomains, setUserDomains] = useState<UserDomain[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
    const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("")

    useEffect(() => {
        fetchDomains()
        fetchUserDomains()
    }, [])

    const fetchDomains = async () => {
        try {
            const response = await fetch("/api/domains")
            const data = await response.json()
            setDomains(data.domains || [])
        } catch (error) {
            console.error("Error fetching domains:", error)
        }
    }

    const fetchUserDomains = async () => {
        try {
            const response = await fetch("/api/user-domains")
            const data = await response.json()
            setUserDomains(data.domains || [])
            setLoading(false)
        } catch (error) {
            console.error("Error fetching user domains:", error)
            setLoading(false)
        }
    }

    const handleDomainSearch = async () => {
        if (!searchTerm.trim()) {
            setSearchResults([])
            return
        }

        console.log("Searching for domain:", searchTerm)
        setSearching(true)
        try {
            const response = await fetch(`/api/domains/check?domain=${encodeURIComponent(searchTerm)}`)
            console.log("Response status:", response.status)

            const data = await response.json()
            console.log("Response data:", data)

            if (response.ok && data.availability) {
                setSearchResults(data.availability)
                console.log("Search results set:", data.availability)
            } else {
                console.error("Domain search failed:", data.error)
                setSearchResults([])
            }
        } catch (error) {
            console.error("Error checking domain:", error)
            setSearchResults([])
        } finally {
            setSearching(false)
        }
    }

    const handlePurchase = async (searchResult: any) => {
        if (!selectedPortfolioId) {
            alert("Please select a portfolio to connect with this domain")
            return
        }

        // Instead of direct payment, redirect to payment page with coupon system
        const paymentUrl = new URL('/payment', window.location.origin)
        paymentUrl.searchParams.set('domain', searchResult.full_domain.split('.')[0])
        paymentUrl.searchParams.set('tld', searchResult.tld)
        paymentUrl.searchParams.set('amount', searchResult.price.toString())
        paymentUrl.searchParams.set('portfolioId', selectedPortfolioId)

        // Add some context for better UX
        paymentUrl.searchParams.set('from', 'domain-management')
        paymentUrl.searchParams.set('fullDomain', searchResult.full_domain)

        window.location.href = paymentUrl.toString()
    }

    const publishedPortfolios = portfolios.filter(p => p.is_published)

    if (loading) {
        return (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                    <CardTitle className="text-white flex items-center">
                        <Globe className="w-5 h-5 mr-2" />
                        Domain Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300">Loading domain information...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Domain Search Section */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                    <CardTitle className="text-white flex items-center">
                        <Globe className="w-5 h-5 mr-2" />
                        Buy a Custom Domain
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                        Get a professional domain for your portfolio like https://www.yourname.me
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                placeholder="Enter desired domain name (e.g., johnsmith)"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    if (e.target.value === "") {
                                        setSearchResults([])
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleDomainSearch()
                                    }
                                }}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            />
                        </div>
                        <Button onClick={handleDomainSearch} className="bg-violet-600 hover:bg-violet-700" disabled={searching || !searchTerm.trim()}>
                            <Search className="w-4 h-4 mr-2" />
                            {searching ? "Searching..." : "Search"}
                        </Button>
                    </div>

                    {searchTerm && searchResults.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {searchResults.map((result, index) => (
                                <Card key={index} className="bg-white/5 border-white/10">
                                    <CardContent className="p-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-white font-medium">
                                                    {result.full_domain}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">₹{result.price}</Badge>
                                                    {result.available ? (
                                                        <Badge className="bg-green-600">Available</Badge>
                                                    ) : (
                                                        <Badge className="bg-red-600">Taken</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                Renewal: ₹{result.renewal_price}/year
                                            </p>
                                            {result.available ? (
                                                <Dialog open={showPurchaseDialog && selectedDomain?.tld === result.tld} onOpenChange={setShowPurchaseDialog}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            className="w-full bg-green-600 hover:bg-green-700"
                                                            onClick={() => setSelectedDomain({ tld: result.tld, price_inr: result.price } as Domain)}
                                                        >
                                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                                            Buy ₹{result.price}
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-slate-900 border-white/20">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-white">Purchase Domain</DialogTitle>
                                                            <DialogDescription className="text-gray-300">
                                                                Complete your purchase for {result.full_domain}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="text-white text-sm">Select Portfolio to Connect:</label>
                                                                <Select value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
                                                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                                                        <SelectValue placeholder="Choose a published portfolio" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {publishedPortfolios.map((portfolio) => (
                                                                            <SelectItem key={portfolio.id} value={portfolio.id}>
                                                                                {portfolio.template_id} Portfolio
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="bg-white/5 p-4 rounded-lg">
                                                                <div className="flex justify-between text-white">
                                                                    <span>Domain: {result.full_domain}</span>
                                                                    <span>₹{result.price}</span>
                                                                </div>
                                                                <div className="text-xs text-gray-400 mt-1">
                                                                    Includes 1 year registration
                                                                </div>
                                                            </div>
                                                            <Button
                                                                onClick={() => handlePurchase(result)}
                                                                className="w-full bg-green-600 hover:bg-green-700"
                                                                disabled={!selectedPortfolioId}
                                                            >
                                                                Buy ₹{result.price} 🎟️ (Apply Coupons Next)
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <Button size="sm" className="w-full" disabled>
                                                    Not Available
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {searchTerm && searching && (
                        <div className="text-center py-8">
                            <div className="text-white">Searching for domains...</div>
                        </div>
                    )}

                    {searchTerm && !searching && searchResults.length === 0 && (
                        <div className="text-center py-8">
                            <div className="text-gray-400">No domains found. Try a different search term.</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* User's Domains Section */}
            {userDomains.length > 0 && (
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardHeader>
                        <CardTitle className="text-white">Your Domains</CardTitle>
                        <CardDescription className="text-gray-300">
                            Manage your purchased domains
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            {userDomains.map((userDomain) => (
                                <DomainSettings
                                    key={userDomain.id}
                                    domain={userDomain}
                                    portfolios={portfolios}
                                    onUpdate={fetchUserDomains}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}