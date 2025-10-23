interface RealizationApiResponse {
  data: {
    name: string
    code: string
    teaching_language: string
    scope_amount: string
    evaluation_scale: string
    gname: string
    office: string
    start_date: string
    end_date: string
    enrollment_start_date: string
    enrollment_end_date: string
    teacher: string
    tgroup: string
    learning_material: string
    further_information: string
    events: Array<{
      event_id: number
      start_date: string
      end_date: string
      subject: string
      location?: Array<{
        class: string
        name: string
        parent: string
      }>
      reserved_for: string[]
      student_groups: string[]
    }>
  }
  cached: boolean
  timestamp: string
}

export class RealizationApiService {
  private static baseUrl = 'http://localhost:3001'

  /**
   * Extracts the realization code from an event title
   * Looks for the last word that starts with 'TE'
   */
  static extractRealizationCode(eventTitle: string): string | null {
    const words = eventTitle.split(' ')
    const lastWord = words[words.length - 1]
    
    if (lastWord && lastWord.toUpperCase().startsWith('TE')) {
      return lastWord.toLowerCase()
    }
    
    return null
  }

  /**
   * Removes the realization code suffix from an event title when present.
   * (e.g TE00DH11-3001)
   */
  static stripRealizationCode(eventTitle: string): string {
    if (!eventTitle) {
      return eventTitle
    }

    const trimmedTitle = eventTitle.trim()
    if (trimmedTitle.length === 0) {
      return eventTitle
    }

    const words = trimmedTitle.split(/\s+/)
    if (words.length === 0) {
      return eventTitle
    }

    const lastWordRaw = words[words.length - 1]
    let lastWord = lastWordRaw

    while (lastWord.length > 0 && '([{'.includes(lastWord[0])) {
      lastWord = lastWord.substring(1)
    }

    while (lastWord.length > 0 && ')]}.,;:!?'.includes(lastWord[lastWord.length - 1])) {
      lastWord = lastWord.substring(0, lastWord.length - 1)
    }

    if (lastWord.toUpperCase().startsWith('TE') && lastWord.includes('-')) {
      const withoutLast = words.slice(0, -1).join(' ').trim()
      return withoutLast.length > 0 ? withoutLast : eventTitle
    }

    return eventTitle
  }

  /**
   * Fetches realization data from the backend API
   */
  static async fetchRealizationData(realizationCode: string): Promise<RealizationApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/realization/${encodeURIComponent(realizationCode)}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data: RealizationApiResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      } else {
        throw new Error('Tuntematon virhe haettaessa toteutustietoja')
      }
    }
  }

  /**
   * Checks if an event title likely contains a realization code
   */
  static hasRealizationCode(eventTitle: string): boolean {
    return this.extractRealizationCode(eventTitle) !== null
  }
}

export default RealizationApiService