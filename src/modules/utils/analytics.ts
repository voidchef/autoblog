import { BetaAnalyticsDataClient, protos } from '@google-analytics/data';

export type IRunReportResponse = protos.google.analytics.data.v1beta.IRunReportResponse;

const analyticsDataClient = new BetaAnalyticsDataClient({
  apiEndpoint: 'analyticsdata.googleapis.com',
  keyFilename: process.env['GA_KEY_FILENAME'] || '',
});

export default async function runReport(startDate: string, endDate: string, slug: string /* , aggregate: any = 0 */) {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${process.env['GA_PROPERTY_ID']}`,
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
