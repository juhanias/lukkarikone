import { useEffect, useRef } from 'react'

/**
 * Sets document.title while the component using this hook is mounted.
 * Restores the previous title on unmount.
 *
 * Usage: useDocumentTitle('Page — lukkari.juh.fi')
 */
export default function useDocumentTitle(title?: string) {
  const previousTitleRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof title !== 'string') return

    previousTitleRef.current = document.title
    document.title = title

    return () => {
      if (previousTitleRef.current !== null) {
        document.title = previousTitleRef.current
      }
    }
  }, [title])
}
