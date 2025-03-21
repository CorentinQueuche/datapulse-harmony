
import React from 'react';
import { ArrowDown, ArrowUp, Users, Eye, MousePointer, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  iconColor: string;
  iconBgColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  iconColor,
  iconBgColor
}) => {
  const isPositive = change >= 0;
  
  return (
    <div className="glass-card p-5 card-hover animate-slide-up-fade">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-analytics-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-analytics-gray-900">{value}</h3>
          <div className="flex items-center mt-2">
            <div className={cn(
              "flex items-center text-sm font-medium mr-2",
              isPositive ? "text-analytics-success" : "text-analytics-error"
            )}>
              {isPositive ? (
                <ArrowUp className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
            <span className="text-analytics-gray-500 text-xs">vs last period</span>
          </div>
        </div>
        <div className={cn(
          "p-3 rounded-lg",
          iconBgColor
        )}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </div>
  );
};

const AnalyticsSummary: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Visitors"
        value="24,532"
        change={12.3}
        icon={Users}
        iconColor="text-analytics-blue"
        iconBgColor="bg-analytics-blue bg-opacity-10"
      />
      <MetricCard
        title="Page Views"
        value="87,129"
        change={8.1}
        icon={Eye}
        iconColor="text-analytics-violet"
        iconBgColor="bg-analytics-violet bg-opacity-10"
      />
      <MetricCard
        title="Conversion Rate"
        value="3.28%"
        change={-2.5}
        icon={MousePointer}
        iconColor="text-analytics-success"
        iconBgColor="bg-analytics-success bg-opacity-10"
      />
      <MetricCard
        title="Avg. Session"
        value="2m 47s"
        change={5.2}
        icon={Clock}
        iconColor="text-analytics-warning"
        iconBgColor="bg-analytics-warning bg-opacity-10"
      />
    </div>
  );
};

export default AnalyticsSummary;
