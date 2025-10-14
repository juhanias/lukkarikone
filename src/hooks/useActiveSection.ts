import { useEffect, useState } from 'react'

export function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || '')

  useEffect(() => {
    const observers = new Map<string, IntersectionObserver>()
    const sectionVisibility = new Map<string, number>()

    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (!element) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Track how much of each section is visible
            sectionVisibility.set(id, entry.intersectionRatio)
          })

          // Find the section with the highest visibility
          let maxVisibility = 0
          let mostVisibleSection = activeSection

          sectionVisibility.forEach((visibility, sectionId) => {
            if (visibility > maxVisibility) {
              maxVisibility = visibility
              mostVisibleSection = sectionId
            }
          })

          if (maxVisibility > 0) {
            setActiveSection(mostVisibleSection)
          }
        },
        {
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
          rootMargin: '-100px 0px -50% 0px'
        }
      )

      observer.observe(element)
      observers.set(id, observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [sectionIds, activeSection])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return { activeSection, scrollToSection }
}
