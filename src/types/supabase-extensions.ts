
// Define types for tables not included in the generated types file
// These should mirror the actual database structure

export interface AnalyticsReport {
  id: string;
  user_id: string;
  source_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  filters: Record<string, any> | null;
  metrics: string[];
  dimensions: string[];
  created_at: string;
  updated_at: string;
}

export interface AnalyticsReportWithSource extends AnalyticsReport {
  analytics_sources: {
    name: string;
  } | null;
}
