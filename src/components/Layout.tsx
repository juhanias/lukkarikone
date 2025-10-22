import { Calendar, Settings, Sun, Moon } from 'lucide-react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import useConfigStore from '../state/state-management'
import { Button } from './ui/button'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { config, isCurrentThemeLight, toggleLightDarkMode } = useConfigStore()

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
            {/* Theme Toggle Button */}
            <Button 
              onClick={toggleLightDarkMode}
              variant="ghost"
              size="sm"
              className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-header-text)',
                border: '1px solid var(--color-border-alpha-30)'
              }}
              title={isCurrentThemeLight() ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {isCurrentThemeLight() ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            <Link to="/app">
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105"
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
              className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105"
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
