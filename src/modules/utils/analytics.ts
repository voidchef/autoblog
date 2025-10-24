import { BetaAnalyticsDataClient, protos } from '@google-analytics/data';

export type IRunReportResponse = protos.google.analytics.data.v1beta.IRunReportResponse;

const analyticsDataClient = new BetaAnalyticsDataClient({
  apiEndpoint: 'analyticsdata.googleapis.com',
  keyFilename: process.env['GA_KEY_FILENAME'] || '',
});

const propertyId = `properties/${process.env['GA_PROPERTY_ID']}`;

/**
 * Run a report for a specific blog
 */
export default async function runReport(startDate: string, endDate: string, slug: string /* , aggregate: any = 0 */) {
  const [response] = await analyticsDataClient.runReport({
    property: propertyId,
    dateRanges: [
      {
        startDate,
        endDate,
      },
    ],
    dimensions: [
      {
        name: 'date',
      },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'pagePathPlusQueryString',
        stringFilter: {
          value: `/blog/${slug}`,
        },
      },
    },
    metrics: [
      {
        name: 'screenPageViews',
      },
    ],
    /* metricAggregations: [aggregate], */
  });
  return response;
}

/**
 * Get overall analytics overview for all pages
 */
export async function getAnalyticsOverview(startDate: string, endDate: string) {
  const [response] = await analyticsDataClient.runReport({
    property: propertyId,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
      { name: 'engagementRate' },
    ],
  });

  const metrics = response.rows?.[0]?.metricValues || [];

  return {
    pageViews: parseInt(metrics[0]?.value || '0', 10),
    totalUsers: parseInt(metrics[1]?.value || '0', 10),
    sessions: parseInt(metrics[2]?.value || '0', 10),
    avgSessionDuration: parseFloat(metrics[3]?.value || '0'),
    bounceRate: parseFloat(metrics[4]?.value || '0'),
    engagementRate: parseFloat(metrics[5]?.value || '0'),
  };
}

/**
 * Get blog-specific page views
 */
export async function getBlogPageViews(startDate: string, endDate: string) {
  const [response] = await analyticsDataClient.runReport({
    property: propertyId,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'pagePathPlusQueryString' }],
    dimensionFilter: {
      filter: {
        fieldName: 'pagePathPlusQueryString',
        stringFilter: {
          matchType: 'BEGINS_WITH' as const,
          value: '/blog/',
        },
      },
    },
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [
      {
        metric: {
          metricName: 'screenPageViews',
        },
        desc: true,
      },
    ],
    limit: 100,
  });

  return (
    response.rows?.map((row) => ({
      path: row.dimensionValues?.[0]?.value || '',
      slug: row.dimensionValues?.[0]?.value?.replace('/blog/', '') || '',
      views: parseInt(row.metricValues?.[0]?.value || '0', 10),
    })) || []
  );
}

/**
 * Get traffic sources breakdown
 */
export async function getTrafficSources(startDate: string, endDate: string) {
  const [response] = await analyticsDataClient.runReport({
    property: propertyId,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }, { name: 'sessionSource' }],
    metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
    orderBys: [
      {
        metric: {
          metricName: 'sessions',
        },
        desc: true,
      },
    ],
    limit: 10,
  });

  return (
    response.rows?.map((row) => ({
      channel: row.dimensionValues?.[0]?.value || 'Unknown',
      source: row.dimensionValues?.[1]?.value || 'Unknown',
      sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
      users: parseInt(row.metricValues?.[1]?.value || '0', 10),
    })) || []
  );
}

/**
 * Get daily trends for a date range
 */
export async function getDailyTrends(startDate: string, endDate: string) {
  const [response] = await analyticsDataClient.runReport({
    property: propertyId,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }, { name: 'sessions' }],
    orderBys: [
      {
        dimension: {
          dimensionName: 'date',
        },
      },
    ],
  });

  return (
    response.rows?.map((row) => ({
      date: row.dimensionValues?.[0]?.value || '',
      pageViews: parseInt(row.metricValues?.[0]?.value || '0', 10),
      users: parseInt(row.metricValues?.[1]?.value || '0', 10),
      sessions: parseInt(row.metricValues?.[2]?.value || '0', 10),
    })) || []
  );
}

/**
 * Get event analytics (custom events tracking)
 */
export async function getEventAnalytics(startDate: string, endDate: string, eventName?: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestConfig: Record<string, any> = {
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'eventName' }, { name: 'customEvent:blog_id' }],
      metrics: [{ name: 'eventCount' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 100,
    };

    if (eventName) {
      requestConfig['dimensionFilter'] = {
        filter: { fieldName: 'eventName', stringFilter: { value: eventName } },
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (await analyticsDataClient.runReport(requestConfig)) as any;
    const response = result[0];

    return (
      response.rows?.map((row: any) => ({
        eventName: row.dimensionValues?.[0]?.value || '',
        blogId: row.dimensionValues?.[1]?.value || '',
        count: parseInt(row.metricValues?.[0]?.value || '0', 10),
      })) || []
    );
  } catch (error) {
    return [];
  }
}

/**
 * Get top pages by page views
 */
export async function getTopPages(startDate: string, endDate: string, limit = 10) {
  const [response] = await analyticsDataClient.runReport({
    property: propertyId,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'pagePathPlusQueryString' }, { name: 'pageTitle' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'averageSessionDuration' }, { name: 'bounceRate' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit,
  });

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.rows?.map((row: any) => ({
      path: row.dimensionValues?.[0]?.value || '',
      title: row.dimensionValues?.[1]?.value || '',
      views: parseInt(row.metricValues?.[0]?.value || '0', 10),
      avgSessionDuration: parseFloat(row.metricValues?.[1]?.value || '0'),
      bounceRate: parseFloat(row.metricValues?.[2]?.value || '0'),
    })) || []
  );
}
