import { getTemplateById } from "@/lib/templates"

export interface GeneratedPortfolio {
  id: string
  userId: string
  templateId: string
  data: PortfolioData
  generatedAt: string
  isPublished: boolean
  customDomain?: string
  slug?: string
}

export interface PortfolioData {
  user: {
    id: string
    name: string
    about: string
    domain: string
    location: string
    resumeUrl?: string
    profilePhoto?: string
  }
  techStack: Array<{
    technology: string
    category: string
  }>
  projects: Array<{
    title: string
    description: string
    githubUrl?: string
    liveUrl?: string
    technologies: string[]
    isFeatured: boolean
  }>
  contactDetails: {
    email?: string
    linkedin?: string
    github?: string
    twitter?: string
    instagram?: string
  }
}

export class PortfolioGenerator {
  private supabase: any

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }

  private generateSlug(name: string, userId: string): string {
    // Create a URL-friendly slug from the user's name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim()

    // Add a portion of the user ID to ensure uniqueness
    const userIdSuffix = userId.slice(-8)
    return `${baseSlug}-${userIdSuffix}`
  }

  async generatePortfolio(userId: string, templateId: string): Promise<GeneratedPortfolio> {
    try {
      // Fetch all user data from database
      const portfolioData = await this.collectUserData(userId)

      // Validate template exists
      const template = getTemplateById(templateId)
      if (!template) {
        throw new Error(`Template ${templateId} not found`)
      }

      const { data: existingPortfolio } = await this.supabase
        .from("portfolios")
        .select("id")
        .eq("user_id", userId)
        .single()

      let portfolio
      if (existingPortfolio) {
        // Update existing portfolio
        const { data, error } = await this.supabase
          .from("portfolios")
          .update({
            template_id: templateId,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to update portfolio: ${error.message}`)
        }
        portfolio = data
      } else {
        const slug = this.generateSlug(portfolioData.user.name, userId)

        // Insert new portfolio
        const { data, error } = await this.supabase
          .from("portfolios")
          .insert({
            user_id: userId,
            template_id: templateId,
            slug: slug,
            is_published: false,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to create portfolio: ${error.message}`)
        }
        portfolio = data
      }

      return {
        id: portfolio.id,
        userId,
        templateId,
        data: portfolioData,
        generatedAt: new Date().toISOString(),
        isPublished: portfolio.is_published,
        customDomain: portfolio.custom_domain,
        slug: portfolio.slug,
      }
    } catch (error) {
      console.error("Portfolio generation error:", error)
      throw error
    }
  }

  private async collectUserData(userId: string): Promise<PortfolioData> {
    try {
      // Fetch user profile
      const { data: user, error: userError } = await this.supabase.from("users").select("*").eq("id", userId).single()

      if (userError) {
        throw new Error(`Failed to fetch user data: ${userError.message}`)
      }

      // Fetch tech stack
      const { data: techStack, error: techError } = await this.supabase
        .from("tech_stacks")
        .select("*")
        .eq("user_id", userId)
        .order("category", { ascending: true })

      if (techError) {
        console.warn("Failed to fetch tech stack:", techError.message)
      }

      // Fetch projects
      const { data: projects, error: projectsError } = await this.supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (projectsError) {
        console.warn("Failed to fetch projects:", projectsError.message)
      }

      // Fetch contact details
      const { data: contactDetails, error: contactError } = await this.supabase
        .from("contact_details")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (contactError) {
        console.warn("Failed to fetch contact details:", contactError.message)
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          about: user.about,
          domain: user.domain || '',
          location: user.location || '',
          resumeUrl: user.resume_url,
          profilePhoto: user.profile_photo,
        },
        techStack: (techStack || []).map((tech: any) => ({
          technology: tech.name,
          category: tech.category || 'Other'
        })),
        projects: (projects || []).map((project: any) => ({
          title: project.title,
          description: project.description,
          githubUrl: project.github_url,
          liveUrl: project.live_url,
          technologies: project.tech_stack || [],
          isFeatured: project.featured || false,
        })),
        contactDetails: {
          email: contactDetails?.email,
          linkedin: contactDetails?.linkedin_url,
          github: contactDetails?.github_url,
          twitter: contactDetails?.twitter_url,
          instagram: contactDetails?.instagram_url,
        },
      }
    } catch (error) {
      console.error("Error collecting user data:", error)
      throw error
    }
  }

  private mapProficiencyLevel(level: number): string {
    const levelMap: { [key: number]: string } = {
      1: "Beginner",
      2: "Intermediate",
      3: "Advanced",
      4: "Expert",
    }
    return levelMap[level] || "Intermediate"
  }

  async publishPortfolio(portfolioId: string, customDomain?: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("portfolios")
        .update({
          is_published: true,
          custom_domain: customDomain,
          updated_at: new Date().toISOString(),
        })
        .eq("id", portfolioId)

      if (error) {
        throw new Error(`Failed to publish portfolio: ${error.message}`)
      }
    } catch (error) {
      console.error("Portfolio publish error:", error)
      throw error
    }
  }

  async getPortfolio(userId: string): Promise<GeneratedPortfolio | null> {
    try {
      const { data: portfolio, error } = await this.supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error || !portfolio) {
        return null
      }

      const portfolioData = await this.collectUserData(userId)

      return {
        id: portfolio.id,
        userId,
        templateId: portfolio.template_id,
        data: portfolioData,
        generatedAt: portfolio.updated_at,
        isPublished: portfolio.is_published,
        customDomain: portfolio.custom_domain,
        slug: portfolio.slug,
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error)
      return null
    }
  }
}
