// GitHub API service for fetching user data, repositories, and contributions
export interface GitHubUser {
  login: string
  name: string
  bio: string
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
  following: number
  created_at: string
  location: string
  company: string
  blog: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  homepage: string
  language: string
  languages_url: string
  stargazers_count: number
  forks_count: number
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
}

export interface GitHubContribution {
  date: string
  count: number
  level: number
}

export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = "GitHubAPIError"
  }
}

export class GitHubAPI {
  private baseUrl = "https://api.github.com"

  private async fetchWithErrorHandling(url: string): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Portfolio-Generator",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new GitHubAPIError("User not found", 404)
        }
        if (response.status === 403) {
          throw new GitHubAPIError("Rate limit exceeded", 403)
        }
        throw new GitHubAPIError(`GitHub API error: ${response.statusText}`, response.status)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof GitHubAPIError) {
        throw error
      }
      throw new GitHubAPIError("Failed to fetch from GitHub API")
    }
  }

  async getUser(username: string): Promise<GitHubUser> {
    return await this.fetchWithErrorHandling(`${this.baseUrl}/users/${username}`)
  }

  async getUserRepos(username: string): Promise<GitHubRepo[]> {
    const repos = await this.fetchWithErrorHandling(`${this.baseUrl}/users/${username}/repos?sort=updated&per_page=100`)
    return repos
  }

  async getPinnedRepos(username: string): Promise<GitHubRepo[]> {
    try {
      // GitHub doesn't have a direct API for pinned repos, so we'll get the most starred/recent repos
      const repos = await this.getUserRepos(username)

      // Sort by stars and recent activity, take top 6
      const sortedRepos = repos
        .filter((repo) => !repo.name.includes(".github.io") && repo.description) // Filter out GitHub Pages and repos without descriptions
        .sort((a, b) => {
          // Prioritize by stars, then by recent updates
          const aScore = a.stargazers_count * 10 + new Date(a.updated_at).getTime() / 1000000000
          const bScore = b.stargazers_count * 10 + new Date(b.updated_at).getTime() / 1000000000
          return bScore - aScore
        })
        .slice(0, 6)

      // Fetch languages for each repo
      const reposWithLanguages = await Promise.all(
        sortedRepos.map(async (repo) => {
          try {
            const languages = await this.fetchWithErrorHandling(repo.languages_url)
            const primaryLanguage = Object.keys(languages)[0] || repo.language
            return { ...repo, language: primaryLanguage }
          } catch {
            return repo
          }
        }),
      )

      return reposWithLanguages
    } catch (error) {
      console.error("Error fetching pinned repos:", error)
      return []
    }
  }

  async getContributions(username: string): Promise<GitHubContribution[]> {
    try {
      // Note: GitHub's contribution graph is not available via public API
      // This is a placeholder that would need to be implemented with GitHub GraphQL API
      // or a third-party service like github-contributions-api

      // For now, we'll return mock data structure
      const contributions: GitHubContribution[] = []
      const today = new Date()

      // Generate last 365 days of mock contribution data
      for (let i = 364; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)

        contributions.push({
          date: date.toISOString().split("T")[0],
          count: Math.floor(Math.random() * 10), // Mock data
          level: Math.floor(Math.random() * 5),
        })
      }

      return contributions
    } catch (error) {
      console.error("Error fetching contributions:", error)
      return []
    }
  }

  async validateUsername(username: string): Promise<boolean> {
    try {
      await this.getUser(username)
      return true
    } catch (error) {
      return false
    }
  }
}

export const githubAPI = new GitHubAPI()
