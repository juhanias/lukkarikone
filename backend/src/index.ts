import express, { Request, Response } from 'express';
import cors from 'cors';
import NodeCache from 'node-cache';
import ICAL from 'ical.js';

const app = express();
const port = process.env.PORT || 3001;

// Initialize cache with 1 hour ttl
const cache = new NodeCache({ stdTTL: 3600 });

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log(`Cache hit for URL: ${calendarUrl}`);
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Fetching calendar from URL: ${calendarUrl}`);

    const response = await fetch(calendarUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch calendar`,
        message: `HTTP ${response.status}: ${response.statusText}`,
        url: calendarUrl
      });
    }

    const calendarData = await response.text();

    try {
      const jcalData = ICAL.parse(calendarData);
      const comp = new ICAL.Component(jcalData);
      
      if (comp.name !== 'vcalendar') {
        throw new Error('Not a valid iCalendar file');
      }

      cache.set(cacheKey, calendarData);
      
      console.log(`Successfully cached calendar data for URL: ${calendarUrl}`);
      
      res.json({
        data: calendarData,
        cached: false,
        timestamp: new Date().toISOString()
      });

    } catch (parseError) {
      console.error('iCal parsing error:', parseError);
      return res.status(400).json({
        error: 'Invalid iCalendar format',
        message: 'The provided URL does not contain valid iCalendar data',
        url: calendarUrl
      });
    }

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
});
