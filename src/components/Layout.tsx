import { Calendar, Settings, Sun, Moon, Ellipsis } from 'lucide-react'
import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import useConfigStore from '../state/state-management'
import { Button } from './ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from './ui/popover'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { config, isCurrentThemeLight, toggleLightDarkMode } = useConfigStore()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname === '/app/settings') {
      navigate('/app')
    } else {
      navigate('/app/settings')
    }
  }

  return (
    <div 
      className='w-full h-full flex flex-col min-w-[320px]'
      style={{ 
        fontFamily: config.font === 'lexend' 
          ? "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)'
      }}
    >
      {/* Header */}
      <header className='p-4 flex gap-4 justify-between items-center flex-shrink-0' style={{
        backgroundColor: isCurrentThemeLight() 
          ? 'var(--color-header-background)' 
          : 'var(--color-surface-alpha-40)', // Match day/week switcher background for dark themes
        borderBottom: '1px solid var(--color-border-alpha-30)'
      }}>
        <div className='w-full max-w-7xl mx-auto flex gap-4 justify-between items-center'>
          <Link to="/?landing" className='text-xl font-medium transition-colors hover:opacity-80' style={{
            color: 'var(--color-header-text)'
          }}>
            juh.fi/lukkari
          </Link>
          <nav className='flex gap-4 items-center'>
            {/* Calendar and Settings buttons (menu placed last) */}
            <Link to="/app">
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                style={{
                  backgroundColor: location.pathname === '/' 
                    ? 'var(--color-header-accent)' 
                    : 'transparent',
                  color: location.pathname === '/' 
                    ? 'white'
                    : 'var(--color-header-text)',
                  border: location.pathname === '/' 
                    ? 'none'
                    : '1px solid var(--color-border-alpha-30)'
                }}
              >
                <Calendar size={18} />
              </Button>
            </Link>
            <Button 
              onClick={handleSettingsClick}
              variant="ghost"
              size="sm"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
              style={{
                backgroundColor: location.pathname === '/settings' 
                  ? 'var(--color-header-accent)' 
                  : 'transparent',
                color: location.pathname === '/settings' 
                  ? 'white'
                  : 'var(--color-header-text)',
                border: location.pathname === '/settings' 
                  ? 'none'
                  : '1px solid var(--color-border-alpha-30)'
              }}
            >
              <Settings size={18} />
            </Button>
            {/* Theme toggle menu */}
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                  style={{
                    backgroundColor: isPopoverOpen ? 'var(--color-header-accent)' : 'transparent',
                    color: isPopoverOpen ? 'white' : 'var(--color-header-text)',
                    border: '1px solid',
                    borderColor: isPopoverOpen ? 'var(--color-header-accent)' : 'var(--color-border-alpha-30)'
                  }}
                  aria-label="Theme options"
                  title="Theme options"
                >
                  <Ellipsis size={18} />
                </Button>
              </PopoverTrigger>

              <PopoverContent 
                align="end" 
                className="w-auto p-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border-alpha-30)',
                  color: 'var(--color-text)'
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 px-3 py-2 text-sm hover:bg-opacity-10"
                  onClick={() => {
                    toggleLightDarkMode()
                    setIsPopoverOpen(false)
                  }}
                  style={{
                    color: 'var(--color-text)'
                  }}
                >
                  {isCurrentThemeLight() ? (
                    <>
                      <Moon size={16} />
                      Switch to dark mode
                    </>
                  ) : (
                    <>
                      <Sun size={16} />
                      Switch to light mode
                    </>
                  )}
                </Button>
              </PopoverContent>
            </Popover>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1 flex flex-col overflow-hidden'>
        <Outlet />
      </main>
    </div>
  )
}
