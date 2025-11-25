import { API_CONFIG } from '../config/api';

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
  private static readonly baseUrl = API_CONFIG.REALIZATION_BASE_URL;

  /**
   * Extracts the realization code from an event title
   * Finds the last occurrence of a code matching pattern: TE + alphanumerics + optional hyphen + numbers
   */
  static extractRealizationCode(eventTitle: string): string | null {
    // Match pattern: TE followed by alphanumerics, optional hyphen and more numbers
    // Handles surrounding punctuation like parentheses, dots, etc.
    const match = eventTitle.match(/\b(TE[A-Z0-9]+-?\d+)/gi)
    
    if (match && match.length > 0) {
      // Return the last match in lowercase
      return match[match.length - 1].toLowerCase()
    }
    
    return null
  }

  /**
   * Removes the realization code from an event title when present.
   */
  static stripRealizationCode(eventTitle: string): string {
    if (!eventTitle) {
      return eventTitle
    }

    // Remove the realization code and surrounding whitespace
    let result = eventTitle
      .replace(/\s*\(?TE[A-Z0-9]+-?\d+\)?[.,;:!?]*\s*/gi, ' ')
      .trim()
    
    // Clean up multiple consecutive spaces
    result = result.replace(/\s+/g, ' ')
    
    return result.length > 0 ? result : eventTitle
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