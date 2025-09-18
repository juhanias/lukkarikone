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
  private static baseUrl = 'https://lukkari-api.juh.fi'

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