import { useState, useCallback, useEffect } from 'react'
import { RealizationApiService } from '../services/realizationApi'
import { useRealizationDialogParam } from './useDialogParams'

interface RealizationData {
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

export const useRealizationDialog = () => {
  const [realizationCode, setRealizationCode] = useRealizationDialogParam()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [realizationData, setRealizationData] = useState<RealizationData | null>(null)

  const isOpen = Boolean(realizationCode)

  // Fetch data when realizationCode changes
  useEffect(() => {
    if (!realizationCode || realizationCode === 'error') {
      setRealizationData(null)
      setError(null)
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      setRealizationData(null)

      try {
        const response = await RealizationApiService.fetchRealizationData(realizationCode)
        setRealizationData(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Virhe haettaessa toteutustietoja')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [realizationCode])

  const openDialog = useCallback(async (eventTitle: string) => {
    const code = RealizationApiService.extractRealizationCode(eventTitle)
    
    if (!code) {
      // Don't open dialog if there's no realization code
      console.warn('No realization code found in event title:', eventTitle)
      return
    }

    setRealizationCode(code)
  }, [setRealizationCode])

  const closeDialog = useCallback(() => {
    setRealizationCode(null)
  }, [setRealizationCode])

  const handleEventClick = useCallback((eventTitle: string) => {
    // Check if this event has a realization code
    if (RealizationApiService.hasRealizationCode(eventTitle)) {
      openDialog(eventTitle)
      return true // Indicate that we handled the click
    }
    return false // Let the original click handler proceed
  }, [openDialog])

  return {
    isOpen,
    isLoading,
    error,
    realizationData,
    openDialog,
    closeDialog,
    handleEventClick
  }
}

export default useRealizationDialog