import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Link, AlertCircle } from 'lucide-react'
import useConfigStore, { useScheduleStore } from '@/state/state-management'

interface CalendarUrlModalProps {
  children: React.ReactNode
}

export function CalendarUrlModal({ children }: CalendarUrlModalProps) {
  const { config, setConfig } = useConfigStore()
  const { refreshSchedule, clearError } = useScheduleStore()
  const [inputUrl, setInputUrl] = useState(config.calendarUrl)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState("")

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      return "Kalenterin URL on pakollinen"
    }

    try {
      new URL(url)
    } catch {
      return "Anna kelvollinen URL-osoite"
    }

    // Validate that it looks like a Turku AMK iCal URL
    if (!url.toLowerCase().includes('turkuamk.fi')) {
      return "URL:n tulee olla Turku AMK:n kalenterijärjestelmästä"
    }

    return ""
  }

  const handleSave = async () => {
    const validationError = validateUrl(inputUrl)
    if (validationError) {
      setError(validationError)
      return
    }

    setConfig({ calendarUrl: inputUrl.trim() })
    setError("")
    setIsOpen(false)
    
    // Clear any existing errors and refresh the schedule
    clearError()
    await refreshSchedule()
  }

  const handleQuickSetup = async () => {
    const ptivis25bUrl = "http://lukkari.turkuamk.fi/ical.php?hash=A64E5FCC3647C6FB5D7770DD86526B01FC67BD8A"
    setConfig({ calendarUrl: ptivis25bUrl })
    setError("")
    setIsOpen(false)
    
    // Clear any existing errors and refresh the schedule
    clearError()
    await refreshSchedule()
  }

  const handleCancel = () => {
    setInputUrl(config.calendarUrl)
    setError("")
    setIsOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel()
    }
    setIsOpen(open)
  }

  return (
    <div style={{ fontFamily: `var(--font-${config.font})` }}>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent 
          className="sm:max-w-[525px]"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            fontFamily: `var(--font-${config.font})`
          }}
        >
        <DialogHeader className="text-left">
          <DialogTitle 
            className="flex items-center gap-2"
            style={{ 
              color: 'var(--color-text)',
              fontFamily: `var(--font-${config.font})`
            }}
          >
            <Calendar className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
            Määritä kalenterin URL
          </DialogTitle>
          <DialogDescription 
            style={{ 
              color: 'var(--color-text-secondary)',
              fontFamily: `var(--font-${config.font})`
            }}
          >
            Valitse PTIVIS25B pikasetup tai anna oma kalenterisi URL-osoite.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Quick Setup Option */}
          <div 
            className="p-4 rounded-md border"
            style={{ 
              backgroundColor: 'var(--color-surface-secondary)',
              borderColor: 'var(--color-border)',
              fontFamily: `var(--font-${config.font})`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium mb-1" style={{ 
                  color: 'var(--color-text)',
                  fontFamily: `var(--font-${config.font})`
                }}>
                  PTIVIS25B
                </h4>
                <p className="text-sm" style={{ 
                  color: 'var(--color-text-secondary)',
                  fontFamily: `var(--font-${config.font})`
                }}>
                  Pikasetup ryhmän kalenterille
                </p>
              </div>
              <Button 
                onClick={handleQuickSetup}
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-text)',
                  border: 'none',
                  fontFamily: `var(--font-${config.font})`
                }}
              >
                Käytä
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <hr style={{ 
              flexGrow: 1, 
              borderColor: 'var(--color-border-alpha-30)' 
            }} />
            <span className="text-sm" style={{ 
              color: 'var(--color-text-secondary)',
              fontFamily: `var(--font-${config.font})`
            }}>
              tai
            </span>
            <hr style={{ 
              flexGrow: 1, 
              borderColor: 'var(--color-border-alpha-30)' 
            }} />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="calendar-url" 
              className="text-sm font-medium"
              style={{ 
                color: 'var(--color-text)',
                fontFamily: `var(--font-${config.font})`
              }}
            >
              Kalenterin URL
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
              <Input
                id="calendar-url"
                placeholder="http://lukkari.turkuamk.fi/ical.php?hash=SINUN_HASH"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value)
                  if (error) setError("") // Clear error when user types
                }}
                className="pl-9"
                style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  fontFamily: `var(--font-${config.font})`
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave()
                  }
                }}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm" style={{ 
                color: 'var(--color-error)',
                fontFamily: `var(--font-${config.font})`
              }}>
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          <div 
            className="p-3 rounded-md text-sm"
            style={{ 
              backgroundColor: 'var(--color-surface-secondary)',
              fontFamily: `var(--font-${config.font})`
            }}
          >
            <p className="font-medium mb-1" style={{ 
              color: 'var(--color-text)',
              fontFamily: `var(--font-${config.font})`
            }}>
              Oma ryhmä/kalenteri?
            </p>
            <p className="mb-2" style={{ 
              color: 'var(--color-text-secondary)',
              fontFamily: `var(--font-${config.font})`
            }}>
              1. Kirjaudu Turku AMK:n lukkarikoneeseen
            </p>
            <p className="mb-2" style={{ 
              color: 'var(--color-text-secondary)',
              fontFamily: `var(--font-${config.font})`
            }}>
              2. Lukujärjestysten hallinta &gt; Luo uusi lukujärjestys
            </p>
            <p className="mb-2" style={{ 
              color: 'var(--color-text-secondary)',
              fontFamily: `var(--font-${config.font})`
            }}>
              3. Konfiguroi kalenteriin haluamasi tunnit / ryhmät
            </p>
            <p className="mb-2" style={{ 
              color: 'var(--color-text-secondary)',
              fontFamily: `var(--font-${config.font})`
            }}>
              4. Napauta kalenteria &gt; Luo iCal-linkki &gt; Kopioi iCal-linkki leikepöydälle
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              backgroundColor: 'transparent',
              fontFamily: `var(--font-${config.font})`
            }}
          >
            Peruuta
          </Button>
          <Button 
            onClick={handleSave}
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-text)',
              border: 'none',
              fontFamily: `var(--font-${config.font})`
            }}
          >
            Linkkaa kalenteri
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  )
}
