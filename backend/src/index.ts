import express, { Request, Response } from 'express';
import cors from 'cors';
import NodeCache from 'node-cache';
import ICAL from 'ical.js';
import crypto from 'crypto';

const app = express();
const port = process.env.PORT || 3001;

// Initialize cache with no automatic TTL - we'll handle staleness manually
const cache = new NodeCache({ stdTTL: 0, useClones: false });

// Track last fetch times for stale-while-revalidate pattern
const lastFetchTimes = new Map<string, number>();

// Common calendar URLs to pre-cache at startup
const PRECACHE_URLS = [
  'http://lukkari.turkuamk.fi/ical.php?hash=9385A6CBC6B79C3DDCE6B2738B5C1B882A6D64CA', // PTIVIS25A
  'http://lukkari.turkuamk.fi/ical.php?hash=6DDA4ADC8FD96BC395D68B8B15340B543D74E3D8', // PTIVIS25B
  'http://lukkari.turkuamk.fi/ical.php?hash=E4AC87D135AF921A83B677DD15A19E6119DDF0BB', // PTIVIS25C
  'http://lukkari.turkuamk.fi/ical.php?hash=E8F13D455EA82E8A7D0990CF6983BBE61AD839A7', // PTIVIS25D
  'http://lukkari.turkuamk.fi/ical.php?hash=346C225AD26BD6966FC656F8E77B5A3EA38A73B5', // PTIVIS25E
  'http://lukkari.turkuamk.fi/ical.php?hash=6EAF3A6D4FC2B07836C2B742EC923629839CA0B7', // PTIVIS25F
];

const STALE_AFTER_MS = 60 * 60 * 1000; // 1 hour

// Helper function to fetch and cache calendar data
async function fetchAndCacheCalendar(calendarUrl: string, cacheKey: string, isBackground = false): Promise<string | null> {
  try {
    if (!isBackground) {
      console.log(`Fetching calendar from URL: ${calendarUrl}`);
    } else {
      console.log(`Background refresh for URL: ${calendarUrl}`);
    }

    const response = await fetch(calendarUrl);
    
    if (!response.ok) {
      console.error(`Failed to fetch calendar: HTTP ${response.status}`);
      return null;
    }

    const calendarData = await response.text();

    // Validate iCal format
    try {
      const jcalData = ICAL.parse(calendarData);
      const comp = new ICAL.Component(jcalData);
      
      if (comp.name !== 'vcalendar') {
        throw new Error('Not a valid iCalendar file');
      }

      // Cache the data and update fetch time
      cache.set(cacheKey, calendarData);
      lastFetchTimes.set(cacheKey, Date.now());
      
      if (!isBackground) {
        console.log(`Successfully cached calendar data for URL: ${calendarUrl}`);
      }
      
      return calendarData;
    } catch (parseError) {
      console.error('iCal parsing error:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Calendar fetch error:', error);
    return null;
  }
}

// Pre-cache common calendar URLs at startup
async function precacheCalendars() {
  console.log('Pre-caching common calendar URLs...');
  const promises = PRECACHE_URLS.map(async (url) => {
    const cacheKey = `calendar_${url}`;
    await fetchAndCacheCalendar(url, cacheKey);
  });
  
  await Promise.all(promises);
  console.log('Pre-caching complete!');
}

// Check if cache entry is stale (older than 1 hour)
function isCacheStale(cacheKey: string): boolean {
  const lastFetch = lastFetchTimes.get(cacheKey);
  if (!lastFetch) return true;
  return Date.now() - lastFetch > STALE_AFTER_MS;
}

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/calendar/hash', async (req: Request, res: Response) => {
  try {
    const calendarUrl = req.query.url as string;
    
    if (!calendarUrl) {
      return res.status(400).json({ 
        error: 'Calendar URL is required',
        message: 'Please provide a calendar URL as a query parameter: ?url=your_calendar_url'
      });
    }

    try {
      new URL(calendarUrl);
    } catch {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        message: 'Please provide a valid calendar URL'
      });
    }

    const cacheKey = `calendar_${calendarUrl}`;
    const cachedData = cache.get<string>(cacheKey);
    const lastFetch = lastFetchTimes.get(cacheKey);
    const isStale = isCacheStale(cacheKey);
    
    // If cache is fresh, return hash of cached data
    if (cachedData && !isStale) {
      const hash = crypto.createHash('sha256').update(cachedData).digest('hex');
      return res.json({
        hash,
        cached: true,
        cachedAt: lastFetch ? new Date(lastFetch).toISOString() : null,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Fetching fresh data for URL: ${calendarUrl}${cachedData ? ' (cache stale)' : ' (no cache)'}`);
    const calendarData = await fetchAndCacheCalendar(calendarUrl, cacheKey);
    
    if (!calendarData) {
      return res.status(400).json({
        error: 'Failed to fetch or parse calendar',
        message: 'The provided URL does not contain valid iCalendar data',
        url: calendarUrl
      });
    }

    const hash = crypto.createHash('sha256').update(calendarData).digest('hex');
    const newLastFetch = lastFetchTimes.get(cacheKey);
    
    res.json({
      hash,
      cached: false,
      cachedAt: newLastFetch ? new Date(newLastFetch).toISOString() : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Calendar hash check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

app.get('/api/realization/:id', async (req: Request, res: Response) => {
  try {
    const realizationId = req.params.id as string;
    
    if (!realizationId) {
      return res.status(400).json({ 
        error: 'Realization ID is required',
        message: 'Please provide a realization ID as a URL parameter'
      });
    }

    // Validate realization ID format (basic validation)
    if (!/^[a-zA-Z0-9\-_]+$/.test(realizationId)) {
      return res.status(400).json({ 
        error: 'Invalid realization ID format',
        message: 'Realization ID contains invalid characters'
      });
    }

    const cacheKey = `realization_${realizationId}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log(`Cache hit for realization ID: ${realizationId}`);
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Fetching realization data for ID: ${realizationId}`);

    const realizationUrl = `https://lukkari.turkuamk.fi/rest/realization/${realizationId}`;
    const response = await fetch(realizationUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch realization data`,
        message: `HTTP ${response.status}: ${response.statusText}`,
        realizationId: realizationId
      });
    }

    const realizationData = await response.json();

    // Cache the realization data
    cache.set(cacheKey, realizationData);
    
    console.log(`Successfully cached realization data for ID: ${realizationId}`);
    
    res.json({
      data: realizationData,
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Realization fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

app.get('/api/calendar', async (req: Request, res: Response) => {
  try {
    const calendarUrl = req.query.url as string;
    
    if (!calendarUrl) {
      return res.status(400).json({ 
        error: 'Calendar URL is required',
        message: 'Please provide a calendar URL as a query parameter: ?url=your_calendar_url'
      });
    }

    try {
      new URL(calendarUrl);
    } catch {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        message: 'Please provide a valid calendar URL'
      });
    }

    const cacheKey = `calendar_${calendarUrl}`;
    const cachedData = cache.get<string>(cacheKey);
    
    // Return cached data if available
    if (cachedData) {
      console.log(`Serving cached calendar data for URL: ${calendarUrl}`);
      return res.json({
        data: cachedData,
        timestamp: new Date().toISOString()
      });
    }

    // Fetch and cache if not available
    const calendarData = await fetchAndCacheCalendar(calendarUrl, cacheKey);
    
    if (!calendarData) {
      return res.status(400).json({
        error: 'Failed to fetch or parse calendar',
        message: 'The provided URL does not contain valid iCalendar data',
        url: calendarUrl
      });
    }

    res.json({
      data: calendarData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Calendar fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

app.listen(port, () => {
  console.log(`beep boop on port ${port}`);
  
  // Pre-cache common calendars after server starts
  precacheCalendars().catch(err => {
    console.error('Pre-caching failed:', err);
  });
});
