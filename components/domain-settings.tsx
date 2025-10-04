"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, ExternalLink, CheckCircle, Clock, AlertTriangle, Link as LinkIcon, Copy, Check } from "lucide-react"
import { Label } from "@/components/ui/label"

interface UserDomain {
    id: string
    domain_name: string
    tld: string
    is_active: boolean
    is_verified: boolean
    expiry_date: string
    portfolio_id?: string
    portfolios?: {
        id: string
        template_id: string
        is_published: boolean
    }
}

interface Portfolio {
    id: string
    template_id: string
    is_published: boolean
}

interface DomainSettingsProps {
    domain: UserDomain
    portfolios: Portfolio[]
    onUpdate: () => void
}

export function DomainSettings({ domain, portfolios, onUpdate }: DomainSettingsProps) {
    const [showSettings, setShowSettings] = useState(false)
    const [selectedPortfolioId, setSelectedPortfolioId] = useState(domain.portfolio_id || "")
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const publishedPortfolios = portfolios.filter(p => p.is_published)
    const dnsInstructions = [
        { type: "A", name: "@", value: "76.76.19.19" },
        { type: "CNAME", name: "www", value: "cname.your-platform.com" }
    ]

    const handlePortfolioUpdate = async () => {
        if (!selectedPortfolioId) return

        setLoading(true)
        try {
            const response = await fetch(`/api/user-domains/${domain.id}/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    portfolio_id: selectedPortfolioId,
                }),
            })

            if (response.ok) {
                onUpdate()
                setShowSettings(false)
            } else {
                alert("Failed to update domain settings")
            }
        } catch (error) {
            console.error("Error updating domain:", error)
            alert("An error occurred while updating domain settings")
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyDomain = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/user-domains/${domain.id}/verify`, {
                method: "POST",
            })

            if (response.ok) {
                onUpdate()
            } else {
                alert("Domain verification failed. Please check your DNS settings.")
            }
        } catch (error) {
            console.error("Error verifying domain:", error)
            alert("An error occurred during domain verification")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const getStatusColor = () => {
        if (domain.is_verified) return "bg-green-600"
        if (domain.is_active) return "bg-yellow-600"
        return "bg-gray-600"
    }

    const getStatusText = () => {
        if (domain.is_verified) return "Active"
        if (domain.is_active) return "Pending Verification"
        return "Inactive"
    }

    const getStatusIcon = () => {
        if (domain.is_verified) return <CheckCircle className="w-3 h-3 mr-1" />
        if (domain.is_active) return <Clock className="w-3 h-3 mr-1" />
        return <AlertTriangle className="w-3 h-3 mr-1" />
    }

    return (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{domain.domain_name}</span>
                        <Badge variant="secondary" className={getStatusColor()}>
                            {getStatusIcon()}
                            {getStatusText()}
                        </Badge>
                    </div>
                    <p className="text-xs text-gray-400">
                        Expires: {new Date(domain.expiry_date).toLocaleDateString()}
                    </p>
                    {domain.portfolios && (
                        <p className="text-xs text-gray-300">
                            Connected to: {domain.portfolios.template_id} Portfolio
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    {domain.is_verified && (
                        <Button size="sm" variant="outline" asChild>
                            <a href={`https://${domain.domain_name}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </Button>
                    )}
                    <Dialog open={showSettings} onOpenChange={setShowSettings}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/20 max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-white">Domain Settings</DialogTitle>
                                <DialogDescription className="text-gray-300">
                                    Manage settings for {domain.domain_name}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* Portfolio Connection */}
                                <div className="space-y-3">
                                    <Label className="text-white">Connected Portfolio</Label>
                                    <Select value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
                                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                            <SelectValue placeholder="Select a portfolio" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {publishedPortfolios.map((portfolio) => (
                                                <SelectItem key={portfolio.id} value={portfolio.id}>
                                                    {portfolio.template_id} Portfolio
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={handlePortfolioUpdate}
                                        disabled={loading || selectedPortfolioId === domain.portfolio_id}
                                        className="w-full"
                                    >
                                        {loading ? "Updating..." : "Update Portfolio Connection"}
                                    </Button>
                                </div>

                                {/* DNS Configuration */}
                                {!domain.is_verified && (
                                    <div className="space-y-3">
                                        <Label className="text-white">DNS Configuration</Label>
                                        <p className="text-sm text-gray-400">
                                            Add these DNS records to your domain provider:
                                        </p>
                                        <div className="space-y-2">
                                            {dnsInstructions.map((record, index) => (
                                                <div key={index} className="bg-white/5 p-3 rounded border border-white/10">
                                                    <div className="grid grid-cols-4 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-gray-400">Type:</span>
                                                            <div className="text-white font-mono">{record.type}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Name:</span>
                                                            <div className="text-white font-mono">{record.name}</div>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="text-gray-400">Value:</span>
                                                            <div className="flex items-center gap-2">
                                                                <code className="text-white bg-black/20 px-2 py-1 rounded text-xs flex-1">
                                                                    {record.value}
                                                                </code>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => copyToClipboard(record.value)}
                                                                    className="p-1 h-6 w-6"
                                                                >
                                                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button
                                            onClick={handleVerifyDomain}
                                            disabled={loading}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                        >
                                            {loading ? "Verifying..." : "Verify DNS Configuration"}
                                        </Button>
                                        <p className="text-xs text-gray-400">
                                            DNS changes can take up to 24 hours to propagate.
                                        </p>
                                    </div>
                                )}

                                {/* Domain Info */}
                                <div className="space-y-3">
                                    <Label className="text-white">Domain Information</Label>
                                    <div className="bg-white/5 p-3 rounded border border-white/10 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Domain:</span>
                                            <span className="text-white">{domain.domain_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Status:</span>
                                            <Badge className={getStatusColor()}>
                                                {getStatusIcon()}
                                                {getStatusText()}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Expires:</span>
                                            <span className="text-white">{new Date(domain.expiry_date).toLocaleDateString()}</span>
                                        </div>
                                        {domain.is_verified && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">URL:</span>
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`https://${domain.domain_name}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-violet-400 hover:text-violet-300 flex items-center gap-1"
                                                    >
                                                        <LinkIcon className="w-3 h-3" />
                                                        https://{domain.domain_name}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}