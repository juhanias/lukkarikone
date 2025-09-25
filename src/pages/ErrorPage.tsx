import { useRouteError, Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

interface RouteError {
  statusText?: string
  message?: string
  status?: number
}

export default function ErrorPage() {
  const error = useRouteError() as RouteError
  
  return (
    <div className='w-full h-full bg-slate-800 text-white flex items-center justify-center'>
      <div className='text-center max-w-md mx-auto p-6'>
        <div className='mb-8'>
          <h1 className='text-6xl font-bold text-red-500 mb-4'>
            {error?.status || ':('}
          </h1>
          <h2 className='text-2xl font-semibold mb-4'>
            Oops! Something went wrong
          </h2>
          <p className='text-gray-400 mb-6'>
            {error?.statusText || error?.message || 'The page you are looking for does not exist.'}
          </p>
        </div>
        
        <div className='space-y-4'>
          <Link 
            to="/" 
            className='inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
          >
            Go Back Home
          </Link>
          <div>
            <Button 
              onClick={() => window.location.reload()}
              variant="link"
              className="text-gray-400 hover:text-white underline p-0 h-auto"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
