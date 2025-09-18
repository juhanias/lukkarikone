import i18n from '../i18n'

export class DateFormatUtils {
  /**
   * Get localized day names from i18n
   */
  private static getLocalizedDays(): string[] {
    const t = i18n.getFixedT(i18n.language, 'schedule')
    return [
      t('dateFormat.days.monday'),
      t('dateFormat.days.tuesday'),
      t('dateFormat.days.wednesday'),
      t('dateFormat.days.thursday'),
      t('dateFormat.days.friday'),
      t('dateFormat.days.saturday'),
      t('dateFormat.days.sunday')
    ]
  }

  /**
   * Get localized short day names from i18n
   */
  private static getLocalizedDaysShort(): string[] {
    const t = i18n.getFixedT(i18n.language, 'schedule')
    return [
      t('dateFormat.daysShort.monday'),
      t('dateFormat.daysShort.tuesday'),
      t('dateFormat.daysShort.wednesday'),
      t('dateFormat.daysShort.thursday'),
      t('dateFormat.daysShort.friday'),
      t('dateFormat.daysShort.saturday'),
      t('dateFormat.daysShort.sunday')
    ]
  }

  /**
   * Get localized month names from i18n
   */
  private static getLocalizedMonths(): string[] {
    const t = i18n.getFixedT(i18n.language, 'schedule')
    return [
      t('dateFormat.months.january'),
      t('dateFormat.months.february'),
      t('dateFormat.months.march'),
      t('dateFormat.months.april'),
      t('dateFormat.months.may'),
      t('dateFormat.months.june'),
      t('dateFormat.months.july'),
      t('dateFormat.months.august'),
      t('dateFormat.months.september'),
      t('dateFormat.months.october'),
      t('dateFormat.months.november'),
      t('dateFormat.months.december')
    ]
  }

  /**
   * Get current locale for date formatting
   */
  private static getCurrentLocale(): string {
    return i18n.language
  }

  /**
   * Formats a date for the day view header
   */
  static formatDayViewDate(date: Date): { dayWeek: string; fullDate: string } {
    const t = i18n.getFixedT(i18n.language, 'schedule')
    
    // Convert Sunday (0) to be day 6, Monday (1) to be day 0, etc.
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1
    const dayNames = this.getLocalizedDays()
    const monthNames = this.getLocalizedMonths()
    
    const dayName = dayNames[dayIndex]
    const dayCapitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1)
    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()

    const week = this.getWeekNumber(date)

    return {
      dayWeek: `${dayCapitalized} - ${t('weekView.weekShort')} ${week}`,
      fullDate: `${day}. ${month} ${year}`
    }
  }

  /**
   * Formats the week header for week view
   */
  static formatWeekHeader(startDate: Date, endDate: Date): string {
    const locale = this.getCurrentLocale()
    const startMonth = startDate.toLocaleString(locale, { month: 'short' })
    const endMonth = endDate.toLocaleString(locale, { month: 'short' })
    
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
    const dayNamesShort = this.getLocalizedDaysShort()
    return includeWeekends 
      ? dayNamesShort 
      : dayNamesShort.filter((_, index: number) => index !== 5 && index !== 6) // Exclude Saturday (5) and Sunday (6)
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
   * Formats current time as HH:MM in 24-hour format
   */
  static getCurrentTimeString(): string {
    const now = new Date()
    const locale = this.getCurrentLocale()
    return now.toLocaleTimeString(locale, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false  // Force 24-hour format
    })
  }
}
