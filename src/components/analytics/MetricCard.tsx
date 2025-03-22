
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface MetricCardProps {
  title: string;
  metric: string;
  sourceId: string | null;
  startDate: string;
  endDate: string;
  reportId?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  metric, 
  sourceId, 
  startDate, 
  endDate,
  reportId
}) => {
  const { data, isLoading } = useAnalyticsData({
    sourceId,
    startDate,
    endDate,
    metrics: [metric],
    reportId
  });

  // Format the value and calculate percent change
  const formatValue = () => {
    if (!data || !data.rows || !sourceId) return { value: "0", change: 0 };
    
    // In a real application, we would calculate this from actual data
    // For demo purposes, generate random values
    const value = Math.floor(Math.random() * 10000).toLocaleString();
    const change = parseFloat((Math.random() * 20 - 10).toFixed(1));
    
    return { value, change };
  };

  const { value, change } = formatValue();
  const isPositive = change >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && sourceId ? (
          <>
            <Skeleton className="h-8 w-[120px]" />
            <Skeleton className="mt-2 h-4 w-[80px]" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <div className="flex items-center text-xs mt-2">
              <span className={`flex items-center font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPositive ? (
                  <ArrowUp className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3" />
                )}
                {Math.abs(change)}%
              </span>
              <span className="text-muted-foreground ml-1">par rapport à la période précédente</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
