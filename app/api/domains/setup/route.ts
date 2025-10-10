import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { FreeDomainService, DevDomainSetup } from "@/lib/free-domain-service"
import { createCloudflareService } from "@/lib/cloudflare-service"
import { dnsVerifier } from "@/lib/dns-verification"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')
        const domain = searchParams.get('domain')

        switch (action) {
            case 'providers':
                return NextResponse.json({
                    providers: FreeDomainService.getProviders(),
                    devSetup: {
                        ngrok: DevDomainSetup.ngrok(),
                        localtunnel: DevDomainSetup.localtunnel('myportfolio'),
                        serveo: DevDomainSetup.serveo('myportfolio')
                    }
                })

            case 'check':
                if (!domain) {
                    return NextResponse.json({ error: 'Domain parameter required' }, { status: 400 })
                }

                const isTestDomain = FreeDomainService.isTestDomain(domain)
                const dnsInfo = await dnsVerifier.getDNSInfo(domain)
                const isReachable = await dnsVerifier.isDomainReachable(domain)

                return NextResponse.json({
                    domain,
                    isTestDomain,
                    isReachable,
                    dnsInfo,
                    recommendations: isTestDomain ?
                        'This is a development domain - perfect for testing!' :
                        'This is a production domain - ensure proper DNS configuration'
                })

            case 'setup':
                const provider = searchParams.get('provider')
                const subdomain = searchParams.get('subdomain')

                if (!provider || !subdomain) {
                    return NextResponse.json({
                        error: 'Provider and subdomain parameters required'
                    }, { status: 400 })
                }

                const devConfig = await FreeDomainService.createDevDomain({
                    subdomain,
                    provider,
                    targetUrl: 'http://localhost:3000'
                })

                return NextResponse.json(devConfig)

            default:
                return NextResponse.json({
                    message: 'Domain Setup API',
                    availableActions: ['providers', 'check', 'setup'],
                    examples: [
                        '/api/domains/setup?action=providers',
                        '/api/domains/setup?action=check&domain=example.com',
                        '/api/domains/setup?action=setup&provider=ngrok&subdomain=myportfolio'
                    ]
                })
        }
    } catch (error) {
        console.error('Domain setup API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, domain, provider } = body

        const supabase = await createClient()

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        switch (action) {
            case 'setup-cloudflare':
                const cfService = createCloudflareService()

                if (!cfService) {
                    return NextResponse.json({
                        error: 'Cloudflare not configured',
                        message: 'Add CLOUDFLARE_API_TOKEN to environment variables',
                        setup: {
                            freeAccount: 'https://cloudflare.com',
                            documentation: 'https://developers.cloudflare.com/api/'
                        }
                    }, { status: 400 })
                }

                const serverIP = process.env.SERVER_IP || '76.76.19.19'
                const platformCNAME = process.env.PLATFORM_CNAME || 'cname.auragen.com'

                const setupResult = await cfService.setupDomain(domain, serverIP, platformCNAME)

                return NextResponse.json({
                    success: true,
                    domain,
                    cloudflareSetup: setupResult,
                    message: 'Domain setup initiated with Cloudflare'
                })

            case 'verify-dev-domain':
                const isDev = FreeDomainService.isTestDomain(domain)

                if (isDev) {
                    // For development domains, create a simplified verification
                    const { error: insertError } = await supabase
                        .from('user_domains')
                        .insert({
                            user_id: user.id,
                            domain_name: domain,
                            tld: '.dev',
                            is_active: true,
                            is_verified: true, // Auto-verify dev domains
                            expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
                            amount_paid: 0,
                        })

                    if (insertError) {
                        return NextResponse.json({ error: 'Failed to register dev domain' }, { status: 500 })
                    }

                    return NextResponse.json({
                        success: true,
                        domain,
                        message: 'Development domain registered successfully',
                        isDevDomain: true
                    })
                }

                return NextResponse.json({
                    error: 'Not a development domain',
                    message: 'Use regular domain verification for production domains'
                }, { status: 400 })

            default:
                return NextResponse.json({
                    error: 'Invalid action',
                    availableActions: ['setup-cloudflare', 'verify-dev-domain']
                }, { status: 400 })
        }

    } catch (error) {
        console.error('Domain setup POST error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}