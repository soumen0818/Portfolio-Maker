import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function convertProficiencyToNumber(proficiency: string | number): number {
  if (typeof proficiency === "number") {
    return proficiency
  }

  const proficiencyMap: { [key: string]: number } = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  }

  return proficiencyMap[proficiency.toLowerCase()] || 2 // Default to intermediate
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { step, data } = await request.json()

    if (!step || !data) {
      return NextResponse.json({ error: "Step and data are required" }, { status: 400 })
    }

    switch (step) {
      case "personal":
        // Save user profile data
        const { error: userError } = await supabase.from("users").upsert({
          id: user.id,
          name: data.name,
          about: data.about,
          resume_url: data.resumeUrl,
          github_username: data.githubUsername,
          updated_at: new Date().toISOString(),
        })

        if (userError) {
          throw new Error(`Failed to save user data: ${userError.message}`)
        }
        break

      case "techstack":
        // Delete existing tech stack and insert new ones
        await supabase.from("tech_stacks").delete().eq("user_id", user.id)

        if (data.techStack && data.techStack.length > 0) {
          const { error: techError } = await supabase.from("tech_stacks").insert(
            data.techStack.map((tech: any) => ({
              user_id: user.id,
              name: tech.technology || tech.name,
              category: tech.category,
              proficiency_level: convertProficiencyToNumber(tech.proficiency || tech.proficiency_level),
            })),
          )

          if (techError) {
            throw new Error(`Failed to save tech stack: ${techError.message}`)
          }
        }
        break

      case "projects":
        // Delete existing projects and insert new ones
        await supabase.from("projects").delete().eq("user_id", user.id)

        if (data.projects && data.projects.length > 0) {
          const { error: projectsError } = await supabase.from("projects").insert(
            data.projects.map((project: any) => ({
              user_id: user.id,
              title: project.title,
              description: project.description,
              github_url: project.githubUrl,
              live_url: project.liveUrl,
              tech_stack: project.technologies || project.tech_stack,
              featured: project.is_featured || false,
            })),
          )

          if (projectsError) {
            throw new Error(`Failed to save projects: ${projectsError.message}`)
          }
        }
        break

      case "contact":
        // Save contact details
        const { error: contactError } = await supabase.from("contact_details").upsert(
          {
            user_id: user.id,
            email: data.contactDetails.email,
            linkedin_url: data.contactDetails.linkedin,
            github_url: data.contactDetails.github,
            twitter_url: data.contactDetails.twitter,
            instagram_url: data.contactDetails.instagram,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          },
        )

        if (contactError) {
          throw new Error(`Failed to save contact details: ${contactError.message}`)
        }
        break

      default:
        return NextResponse.json({ error: "Invalid step" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Data saved successfully",
    })
  } catch (error) {
    console.error("Save data error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save data" }, { status: 500 })
  }
}
