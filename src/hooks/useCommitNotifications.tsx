import { useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import useConfigStore, { useSeenCommitsStore } from '../state/state-management'

const GITHUB_API_URL = 'https://api.github.com/repos/juhanias/lukkarikone/commits'
const CHECK_INTERVAL = 5 * 60 * 1000 // Check every 5 minutes

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  html_url: string
  author?: {
    login: string
    avatar_url: string
  } | null
}

/**
 * Hook to check for new commits and show toast notifications
 * Only runs when enableCommitNotifications is enabled
 */
export function useCommitNotifications() {
  const { config } = useConfigStore()
  const { seenCommits, addSeenCommits, hasSeenCommit } = useSeenCommitsStore()
  const isEnabled = config.enableCommitNotifications || false
  const hasInitialized = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAndNotify = useCallback(async () => {
    if (!isEnabled) return

    try {
      const response = await fetch(GITHUB_API_URL, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        console.warn('Failed to fetch commits:', response.status)
        return
      }

      const commits: GitHubCommit[] = await response.json()
      
      // On first run, just mark all current commits as seen (don't spam notifications)
      if (!hasInitialized.current) {
        hasInitialized.current = true
        // If user has no seen commits, initialize with current commits
        if (seenCommits.length === 0) {
          const allShas = commits.map(c => c.sha)
          addSeenCommits(allShas)
          return
        }
      }

      // Find new commits (ones not in seenCommits)
      const newCommits = commits.filter(commit => !hasSeenCommit(commit.sha))

      if (newCommits.length > 0) {
        // Show toast for each new commit (most recent first, limit to 5)
        const commitsToShow = newCommits.slice(0, 5)
        
        commitsToShow.forEach((commit, index) => {
          const shortSha = commit.sha.substring(0, 7)
          const message = commit.commit.message.split('\n')[0] // First line only
          const truncatedMessage = message.length > 60 ? message.substring(0, 57) + '...' : message
          const authorName = commit.author?.login || commit.commit.author.name
          const avatarUrl = commit.author?.avatar_url

          setTimeout(() => {
            toast(truncatedMessage, {
              description: `${shortSha} by ${authorName}`,
              icon: avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={authorName}
                  className="w-5 h-5 rounded-full"
                />
              ) : undefined,
              duration: 8000,
              action: {
                label: 'View',
                onClick: () => window.open(commit.html_url, '_blank')
              }
            })
          }, index * 500) // Stagger toasts
        })

        // Mark all fetched commits as seen
        addSeenCommits(commits.map(c => c.sha))
      }
    } catch (error) {
      console.warn('Error fetching commits:', error)
    }
  }, [isEnabled, seenCommits.length, hasSeenCommit, addSeenCommits])

  useEffect(() => {
    if (!isEnabled) {
      // Clear interval if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      hasInitialized.current = false
      return
    }

    // Initial fetch
    fetchAndNotify()

    // Set up interval for periodic checks
    intervalRef.current = setInterval(fetchAndNotify, CHECK_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isEnabled, fetchAndNotify])
}
