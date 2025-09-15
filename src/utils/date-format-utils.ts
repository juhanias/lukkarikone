export class DateFormatUtils {
  private static readonly DAYS_FI = ['maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai', 'sunnuntai']
  private static readonly MONTHS_FI = ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu',
    'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu']
  
  private static readonly DAY_NAMES_SHORT = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su']

  /**
   * Formats a date for the day view header
   */
  static formatDayViewDate(date: Date): { dayWeek: string; fullDate: string } {
    // Convert Sunday (0) to be day 6, Monday (1) to be day 0, etc.
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1
    const dayName = this.DAYS_FI[dayIndex]
    const dayCapitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1)
    const day = date.getDate()
    const month = this.MONTHS_FI[date.getMonth()]
    const year = date.getFullYear()

    const week = this.getWeekNumber(date)

    return {
      dayWeek: `${dayCapitalized} - vk ${week}`,
      fullDate: `${day}. ${month} ${year}`
    }
  }

  /**
   * Formats the week header for week view
   */
  static formatWeekHeader(startDate: Date, endDate: Date): string {
    const startMonth = startDate.toLocaleString('fi', { month: 'short' })
    const endMonth = endDate.toLocaleString('fi', { month: 'short' })
    
    if (startMonth === endMonth) {
      return `${startDate.getDate()}. - ${endDate.getDate()}. ${startMonth}`
    } else {
      return `${startDate.getDate()}. ${startMonth} - ${endDate.getDate()}. ${endMonth}`
    }
  }

  /**
   * Gets week number for a given date (ISO 8601 standard - Monday as first day)
   */
  static getWeekNumber(date: Date): number {
    // Create a copy of the date to avoid modifying the original
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    
    // Set to Thursday of this week (day 4 in ISO week)
    const dayOfWeek = d.getUTCDay() || 7 // Convert Sunday (0) to 7
    d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek)
    
    // Get the year start
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    
    // Calculate the week number
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  /**
   * Gets short day names for week view, optionally filtered to exclude weekends
   */
  static getDayNamesShort(includeWeekends: boolean = true): string[] {
    return includeWeekends 
      ? this.DAY_NAMES_SHORT 
      : this.DAY_NAMES_SHORT.filter((_, index) => index !== 5 && index !== 6) // Exclude Saturday (5) and Sunday (6)
  }

  /**
   * Gets the current time in hours as a decimal (e.g., 14.5 for 2:30 PM)
   */
  static getCurrentTimeInHours(): number {
    const now = new Date()
    return now.getHours() + (now.getMinutes() / 60)
  }

  /**
   * Checks if the current date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  /**
   * Formats current time as HH:MM
   */
  static getCurrentTimeString(): string {
    const now = new Date()
    return now.toLocaleTimeString('fi', { hour: '2-digit', minute: '2-digit' })
  }
}
