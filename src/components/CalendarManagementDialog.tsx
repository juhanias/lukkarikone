import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Calendar, Plus, Trash2, Edit2, Link as LinkIcon, Check, X } from 'lucide-react'
import { useCalendarStore } from '../state/state-management'
import type { Calendar as CalendarType } from '../types/calendar'
import { Button } from './ui/button'
import { Input } from './ui/input'

const PRESET_ICAL_URLS = [
  {
    id: 'ptivis25a',
    url: 'http://lukkari.turkuamk.fi/ical.php?hash=9385A6CBC6B79C3DDCE6B2738B5C1B882A6D64CA',
    label: 'PTIVIS25A'
  },
  {
    id: 'ptivis25b',
    url: 'http://lukkari.turkuamk.fi/ical.php?hash=6DDA4ADC8FD96BC395D68B8B15340B543D74E3D8',
    label: 'PTIVIS25B'
  },
  {
    id: 'ptivis25c',
    url: 'http://lukkari.turkuamk.fi/ical.php?hash=E4AC87D135AF921A83B677DD15A19E6119DDF0BB',
    label: 'PTIVIS25C'
  },
  {
    id: 'ptivis25d',
    url: 'http://lukkari.turkuamk.fi/ical.php?hash=E8F13D455EA82E8A7D0990CF6983BBE61AD839A7',
    label: 'PTIVIS25D'
  },
  {
    id: 'ptivis25e',
    url: 'http://lukkari.turkuamk.fi/ical.php?hash=346C225AD26BD6966FC656F8E77B5A3EA38A73B5',
    label: 'PTIVIS25E'
  },
  {
    id: 'ptivis25f',
    url: 'http://lukkari.turkuamk.fi/ical.php?hash=6EAF3A6D4FC2B07836C2B742EC923629839CA0B7',
    label: 'PTIVIS25F'
  }
] as const

interface CalendarManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CalendarManagementDialog = ({ open, onOpenChange }: CalendarManagementDialogProps) => {
  const { t } = useTranslation('common')
  const {
    calendars,
    activeCalendarId,
    addCalendar,
    updateCalendar,
    deleteCalendar,
    setActiveCalendar,
    addIcalUrl,
    removeIcalUrl,
    updateIcalUrl
  } = useCalendarStore()

  const [isCreating, setIsCreating] = useState(false)
  const [newCalendarName, setNewCalendarName] = useState('')
  const [editingCalendarId, setEditingCalendarId] = useState<string | null>(null)
  const [editingCalendarName, setEditingCalendarName] = useState('')
  const [editingUrlState, setEditingUrlState] = useState<{
    calendarId: string
    oldUrl: string
    newUrl: string
  } | null>(null)
  const [newUrlState, setNewUrlState] = useState<{
    calendarId: string
    url: string
  } | null>(null)

  const handleCreateCalendar = () => {
    if (newCalendarName.trim()) {
      const id = addCalendar(newCalendarName.trim())
      setNewCalendarName('')
      setIsCreating(false)
      // Optionally set as active
      if (calendars.length === 0) {
        setActiveCalendar(id)
      }
    }
  }

  const handleUpdateCalendarName = (calendarId: string) => {
    if (editingCalendarName.trim()) {
      updateCalendar(calendarId, { name: editingCalendarName.trim() })
      setEditingCalendarId(null)
      setEditingCalendarName('')
    }
  }

  const handleDeleteCalendar = (calendarId: string) => {
    if (confirm(t('calendars.confirmDelete') || 'Are you sure you want to delete this calendar?')) {
      deleteCalendar(calendarId)
    }
  }

  const handleAddUrl = (calendarId: string) => {
    if (newUrlState && newUrlState.url.trim()) {
      addIcalUrl(calendarId, newUrlState.url.trim())
      setNewUrlState(null)
    }
  }

  const handleUpdateUrl = () => {
    if (editingUrlState && editingUrlState.newUrl.trim()) {
      updateIcalUrl(editingUrlState.calendarId, editingUrlState.oldUrl, editingUrlState.newUrl.trim())
      setEditingUrlState(null)
    }
  }

  const startEditingCalendar = (calendar: CalendarType) => {
    setEditingCalendarId(calendar.id)
    setEditingCalendarName(calendar.name)
  }

  const startEditingUrl = (calendarId: string, url: string) => {
    setEditingUrlState({ calendarId, oldUrl: url, newUrl: url })
  }

  // Helper function to get preset name if URL matches a preset
  const getPresetName = (url: string): string | null => {
    const preset = PRESET_ICAL_URLS.find(p => p.url === url)
    return preset ? preset.label : null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Calendar className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
            {t('calendars.title') || 'Manage Calendars'}
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--color-text-secondary)' }}>
            {t('calendars.description') || 'Create and manage your calendars. Each calendar can have multiple iCal URLs.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Calendar List */}
          {calendars.map((calendar) => (
            <div
              key={calendar.id}
              className="border rounded-lg p-4 space-y-3"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: calendar.id === activeCalendarId 
                  ? 'var(--color-accent-alpha-10)' 
                  : 'transparent'
              }}
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <div className="flex-1 flex items-center gap-2">
                  {editingCalendarId === calendar.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={editingCalendarName}
                        onChange={(e) => setEditingCalendarName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateCalendarName(calendar.id)
                          if (e.key === 'Escape') {
                            setEditingCalendarId(null)
                            setEditingCalendarName('')
                          }
                        }}
                        placeholder={t('calendars.calendarNamePlaceholder') || 'Calendar name'}
                        autoFocus
                        style={{
                          backgroundColor: 'var(--color-surface-secondary)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)'
                        }}
                      />
                      <Button
                        onClick={() => handleUpdateCalendarName(calendar.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingCalendarId(null)
                          setEditingCalendarName('')
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>
                        {calendar.name}
                      </h3>
                      {calendar.id === activeCalendarId && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: 'var(--color-accent)',
                            color: 'white'
                          }}
                        >
                          {t('calendars.active') || 'Active'}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {editingCalendarId !== calendar.id && (
                  <div className="flex items-center gap-1">
                    {calendar.id !== activeCalendarId && (
                      <Button
                        onClick={() => setActiveCalendar(calendar.id)}
                        variant="ghost"
                        size="sm"
                        title={t('calendars.setActive') || 'Set as active'}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => startEditingCalendar(calendar)}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteCalendar(calendar.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* iCal URLs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {t('calendars.icalUrls') || 'iCal URLs'} ({calendar.icalUrls.length})
                  </span>
                  <Button
                    onClick={() => setNewUrlState({ calendarId: calendar.id, url: '' })}
                    variant="ghost"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {calendar.icalUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded"
                    style={{ backgroundColor: 'var(--color-surface-secondary-alpha-20)' }}
                  >
                    {editingUrlState?.calendarId === calendar.id && editingUrlState.oldUrl === url ? (
                      <>
                        <Input
                          value={editingUrlState.newUrl}
                          onChange={(e) => setEditingUrlState({ ...editingUrlState, newUrl: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateUrl()
                            if (e.key === 'Escape') setEditingUrlState(null)
                          }}
                          placeholder={t('calendars.urlPlaceholder') || 'https://...'}
                          autoFocus
                          className="flex-1"
                          style={{
                            backgroundColor: 'var(--color-surface-secondary)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)'
                          }}
                        />
                        <Button
                          onClick={handleUpdateUrl}
                          variant="ghost"
                          size="sm"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setEditingUrlState(null)}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                        <span 
                          className="text-sm flex-1 font-mono break-all" 
                          style={{ 
                            color: 'var(--color-text)',
                            wordBreak: 'break-all',
                            overflowWrap: 'anywhere'
                          }}
                          title={url}
                        >
                          {getPresetName(url) || url}
                        </span>
                        <Button
                          onClick={() => startEditingUrl(calendar.id, url)}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => removeIcalUrl(calendar.id, url)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}

                {/* New URL Input */}
                {newUrlState?.calendarId === calendar.id && (
                  <div className="space-y-3 p-3 rounded-lg border" style={{ 
                    backgroundColor: 'var(--color-surface-secondary-alpha-20)',
                    borderColor: 'var(--color-border-alpha-30)'
                  }}>
                    {/* Preset URLs */}
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {t('calendars.quickAdd') || 'Quick Add'}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                        {PRESET_ICAL_URLS.map((preset) => (
                          <Button
                            key={preset.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNewUrlState({ ...newUrlState, url: preset.url })
                            }}
                            className="text-xs h-7"
                            style={{
                              backgroundColor: newUrlState.url === preset.url 
                                ? 'var(--color-accent-alpha-20)' 
                                : 'var(--color-surface-secondary)',
                              borderColor: newUrlState.url === preset.url 
                                ? 'var(--color-accent)' 
                                : 'var(--color-border)',
                              color: 'var(--color-text)'
                            }}
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-2">
                      <hr style={{ flexGrow: 1, borderColor: 'var(--color-border-alpha-30)' }} />
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {t('actions.or') || 'or'}
                      </span>
                      <hr style={{ flexGrow: 1, borderColor: 'var(--color-border-alpha-30)' }} />
                    </div>

                    {/* Custom URL Input */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={newUrlState.url}
                        onChange={(e) => setNewUrlState({ ...newUrlState, url: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddUrl(calendar.id)
                          if (e.key === 'Escape') setNewUrlState(null)
                        }}
                        placeholder={t('calendars.urlPlaceholder') || 'https://...'}
                        autoFocus
                        className="flex-1"
                        style={{
                          backgroundColor: 'var(--color-surface-secondary)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)'
                        }}
                      />
                      <Button
                        onClick={() => handleAddUrl(calendar.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setNewUrlState(null)}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {calendar.icalUrls.length === 0 && !newUrlState && (
                  <p className="text-sm text-center py-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {t('calendars.noUrls') || 'No iCal URLs yet. Add one to get started.'}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Create New Calendar */}
          {isCreating ? (
            <div className="border rounded-lg p-4" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <Input
                  value={newCalendarName}
                  onChange={(e) => setNewCalendarName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateCalendar()
                    if (e.key === 'Escape') {
                      setIsCreating(false)
                      setNewCalendarName('')
                    }
                  }}
                  placeholder={t('calendars.calendarNamePlaceholder') || 'Calendar name'}
                  autoFocus
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
                <Button
                  onClick={handleCreateCalendar}
                  variant="ghost"
                  size="sm"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false)
                    setNewCalendarName('')
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full border-2 border-dashed rounded-lg p-4 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)'
              }}
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">{t('calendars.createNew') || 'Create New Calendar'}</span>
            </button>
          )}

          {calendars.length === 0 && !isCreating && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" style={{ color: 'var(--color-text-secondary)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {t('calendars.empty') || 'No calendars yet. Create one to get started!'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
