import { NextRequest, NextResponse } from "next/server"
import { dnsVerifier } from "@/lib/dns-verification"
import { FreeDomainService } from "@/lib/free-domain-service"
import { SSLService } from "@/lib/ssl-service"
import { createCloudflareService } from "@/lib/cloudflare-service"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('type') || 'all'
    const domain = searchParams.get('domain') || 'example.com'

    const results: any = {
        timestamp: new Date().toISOString(),
        domain,
        tests: {}
    }

    try {
        switch (testType) {
            case 'dns':
                results.tests.dns = await testDNSVerification(domain)
                break

            case 'ssl':
                results.tests.ssl = await testSSLStatus(domain)
                break

            case 'providers':
                results.tests.providers = await testProviders()
                break

            case 'environment':
                results.tests.environment = testEnvironmentConfig()
                break

            case 'middleware':
                results.tests.middleware = testMiddlewareConfig(request)
                break

            case 'all':
            default:
                results.tests.dns = await testDNSVerification(domain)
                results.tests.ssl = await testSSLStatus(domain)
                results.tests.providers = await testProviders()
                results.tests.environment = testEnvironmentConfig()
                results.tests.middleware = testMiddlewareConfig(request)
                break
        }

        // Add system health summary
        results.health = {
            overall: calculateOverallHealth(results.tests),
            recommendations: generateRecommendations(results.tests)
        }

        return NextResponse.json(results)

    } catch (error) {
        return NextResponse.json({
            error: 'Test execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}

async function testDNSVerification(domain: string) {
    const results = {
        domain,
        verification: null as any,
        reachable: false,
        isTestDomain: false,
        dnsInfo: null as any,
        status: 'unknown'
    }

    try {
        // Test if it's a development domain
        results.isTestDomain = FreeDomainService.isTestDomain(domain)

        // Test DNS verification
        results.verification = await dnsVerifier.verifyDomain(domain)

        // Test if domain is reachable
        results.reachable = await dnsVerifier.isDomainReachable(domain)

        // Get detailed DNS info
        results.dnsInfo = await dnsVerifier.getDNSInfo(domain)

        // Determine status
        if (results.isTestDomain) {
            results.status = 'test_domain'
        } else if (results.verification.success) {
            results.status = 'verified'
        } else if (results.reachable) {
            results.status = 'reachable_not_configured'
        } else {
            results.status = 'unreachable'
        }

    } catch (error) {
        results.status = 'error'
        results.verification = { error: error instanceof Error ? error.message : 'Unknown error' }
    }

    return results
}

async function testSSLStatus(domain: string) {
    const results = {
        domain,
        hasSSL: false,
        certificate: null as any,
        provider: 'unknown',
        recommendations: [] as string[],
        status: 'unknown'
    }

    try {
        const sslStatus = await SSLService.checkSSLStatus(domain)
        results.hasSSL = sslStatus.hasSSL
        results.certificate = sslStatus.certificate
        results.provider = sslStatus.provider || 'unknown'

        if (sslStatus.hasSSL) {
            results.status = 'ssl_enabled'
        } else {
            results.status = 'ssl_disabled'
            results.recommendations.push('Enable SSL certificate for security')
        }

        // Add provider recommendations
        if (domain.includes('vercel.app')) {
            results.recommendations.push('Vercel provides automatic SSL')
        } else if (domain.includes('netlify.app')) {
            results.recommendations.push('Netlify provides automatic SSL')
        } else {
            results.recommendations.push('Consider using Cloudflare for free SSL')
        }

    } catch (error) {
        results.status = 'error'
        results.certificate = { error: error instanceof Error ? error.message : 'Unknown error' }
    }

    return results
}

async function testProviders() {
    const results = {
        freeDomains: FreeDomainService.getProviders(),
        sslProviders: SSLService.getProviders(),
        cloudflare: {
            configured: false,
            error: null as string | null
        }
    }

    try {
        const cfService = createCloudflareService()
        results.cloudflare.configured = cfService !== null

        if (cfService) {
            // Test basic Cloudflare connectivity
            try {
                await cfService.getZoneInfo()
                results.cloudflare.configured = true
            } catch (error) {
                results.cloudflare.error = error instanceof Error ? error.message : 'Cloudflare connection failed'
            }
        }
    } catch (error) {
        results.cloudflare.error = error instanceof Error ? error.message : 'Cloudflare setup error'
    }

    return results
}

function testEnvironmentConfig() {
    const config = {
        development: {
            mode: process.env.DEVELOPMENT_MODE === 'true',
            allowDevDomains: process.env.ALLOW_DEV_DOMAINS === 'true',
            skipSSLVerification: process.env.SKIP_SSL_VERIFICATION === 'true'
        },
        dns: {
            serverIP: process.env.SERVER_IP || 'not_set',
            platformCNAME: process.env.PLATFORM_CNAME || 'not_set'
        },
        cloudflare: {
            apiToken: process.env.CLOUDFLARE_API_TOKEN ? 'set' : 'not_set',
            email: process.env.CLOUDFLARE_EMAIL ? 'set' : 'not_set',
            apiKey: process.env.CLOUDFLARE_API_KEY ? 'set' : 'not_set',
            zoneId: process.env.CLOUDFLARE_ZONE_ID ? 'set' : 'not_set'
        },
        recommendations: [] as string[]
    }

    // Add recommendations
    if (!config.development.mode) {
        config.recommendations.push('Enable DEVELOPMENT_MODE for testing')
    }

    if (config.dns.serverIP === 'not_set') {
        config.recommendations.push('Set SERVER_IP environment variable')
    }

    if (config.cloudflare.apiToken === 'not_set' && config.cloudflare.apiKey === 'not_set') {
        config.recommendations.push('Configure Cloudflare credentials for DNS management')
    }

    return config
}

function testMiddlewareConfig(request: NextRequest) {
    const hostname = request.headers.get("host") || request.nextUrl.hostname

    const mainDomains = [
        'localhost',
        '127.0.0.1',
        'vercel.app',
        'netlify.app',
        'railway.app',
        'herokuapp.com'
    ]

    const isCustomDomain = !mainDomains.some(domain => hostname.includes(domain))

    return {
        hostname,
        isCustomDomain,
        mainDomains,
        userAgent: request.headers.get('user-agent'),
        protocol: request.nextUrl.protocol,
        recommendations: isCustomDomain ?
            ['Custom domain detected - ensure proper routing'] :
            ['Using main domain - custom domain routing not tested']
    }
}

function calculateOverallHealth(tests: any): 'healthy' | 'warning' | 'error' {
    const issues = []

    if (tests.dns?.status === 'error') issues.push('dns')
    if (tests.ssl?.status === 'error') issues.push('ssl')
    if (tests.providers?.cloudflare?.error) issues.push('cloudflare')

    if (issues.length === 0) return 'healthy'
    if (issues.length <= 1) return 'warning'
    return 'error'
}

function generateRecommendations(tests: any): string[] {
    const recommendations = []

    if (tests.dns?.status === 'reachable_not_configured') {
        recommendations.push('Configure DNS records to point to your server')
    }

    if (tests.ssl?.status === 'ssl_disabled') {
        recommendations.push('Enable SSL certificate for security')
    }

    if (!tests.environment?.development?.mode) {
        recommendations.push('Enable development mode for testing')
    }

    if (tests.providers?.cloudflare?.error) {
        recommendations.push('Fix Cloudflare configuration for DNS management')
    }

    return recommendations
}