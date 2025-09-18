import { Calendar, Settings } from 'lucide-react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import useConfigStore from '../state/state-management'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { config } = useConfigStore()

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname === '/settings') {
      navigate('/')
    } else {
      navigate('/settings')
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
        backgroundColor: 'var(--color-surface-alpha-40)',
        borderBottom: '1px solid var(--color-border-alpha-30)'
      }}>
        <div className='w-full max-w-7xl mx-auto flex gap-4 justify-between items-center'>
          <Link to="/" className='text-xl font-medium transition-colors hover:opacity-80' style={{
            color: 'var(--color-accent)'
          }}>
            juh.fi/lukkari
          </Link>
          <nav className='flex gap-4 items-center'>
            <Link 
              to="/" 
              className='px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105'
              style={{
                backgroundColor: location.pathname === '/' 
                  ? 'var(--color-accent)' 
                  : 'transparent',
                color: location.pathname === '/' 
                  ? 'white'
                  : 'var(--color-text-secondary)',
                border: location.pathname === '/' 
                  ? 'none'
                  : '1px solid var(--color-border-alpha-30)'
              }}
            >
              <Calendar />
            </Link>
            <button 
              onClick={handleSettingsClick}
              className='px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105'
              style={{
                backgroundColor: location.pathname === '/settings' 
                  ? 'var(--color-accent)' 
                  : 'transparent',
                color: location.pathname === '/settings' 
                  ? 'white'
                  : 'var(--color-text-secondary)',
                border: location.pathname === '/settings' 
                  ? 'none'
                  : '1px solid var(--color-border-alpha-30)'
              }}
            >
              <Settings />
            </button>
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
