import { Elysia } from 'elysia'
import { html } from '@elysiajs/html'

const app = new Elysia()

// html enable
app.use(html())

// Route
app.get('/', async () => {
  // Render frontend
  const htmlContent = await Bun.file('./src/views/index.html').text();
  return new Response(htmlContent, {
    headers: {'Content-Type': 'text/html'}
  })
})

// handle date calculation
app.post('/calculate', ({ body }) => {
  const { startDate: startDateStr, endDate: endDateStr } = body as { startDate: string; endDate: string }
  let shift = 0;

  try {
    // Parse date
    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format')
    }

    // Create Date dictionary
    let dateDict: {[key: string]: number} = {};
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      // Calculate range end (10 days)
      let rangeEnd = new Date(currentDate);
      rangeEnd.setDate(rangeEnd.getDate() + 9);
      if (rangeEnd > endDate) {
        rangeEnd = new Date(endDate)
      }

      // Added dates to dictionary
      while (currentDate <= rangeEnd) {
        const dateKey = currentDate.toISOString().split('T')[0] as any; // as any lazy fix to correct type 
        dateDict[dateKey] = shift;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Skip 1 days
      currentDate.setDate(currentDate.getDate() + 1)
      shift = shift >= 4 ? 0 : shift + 1;

    }

    return {
      dateDict,
      startDate: startDateStr,
      endDate: endDateStr
    }

  } catch (error) {
    throw new Error('Invalid date format. Use yyyy-mm-dd for dates.')
  }
})



app.listen(5000, () => {
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
})