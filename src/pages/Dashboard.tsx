
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import AnalyticsSummary from '@/components/analytics/AnalyticsSummary';
import VisitorsChart from '@/components/analytics/VisitorsChart';
import PerformanceMetrics from '@/components/analytics/PerformanceMetrics';
import TrafficSources from '@/components/analytics/TrafficSources';
import { Calendar, ChevronDown, Filter } from 'lucide-react';

const Dashboard = () => {
  const [websiteFilter, setWebsiteFilter] = useState('all');
  const [showWebsiteFilter, setShowWebsiteFilter] = useState(false);
  
  const websites = [
    { label: 'All Websites', value: 'all' },
    { label: 'Main Website', value: 'main' },
    { label: 'Blog', value: 'blog' },
    { label: 'E-commerce', value: 'ecommerce' },
    { label: 'Landing Pages', value: 'landing' },
  ];
  
  const dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'This month', value: 'month' },
    { label: 'Last month', value: 'lastmonth' },
    { label: 'Custom range', value: 'custom' },
  ];

  return (
    <div className="flex h-screen bg-analytics-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard" 
          subtitle="Overview of your analytics data"
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-semibold text-analytics-gray-900">Analytics Overview</h2>
              <div className="ml-3 px-2 py-1 bg-analytics-blue bg-opacity-10 rounded-md text-xs font-medium text-analytics-blue">
                Live
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowWebsiteFilter(!showWebsiteFilter)} 
                  className="btn-outline flex items-center px-3 py-2 text-sm"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span>{websites.find(w => w.value === websiteFilter)?.label}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>
                
                {showWebsiteFilter && (
                  <div className="absolute right-0 mt-1 w-48 bg-white shadow-lg rounded-md border border-analytics-gray-200 py-1 z-10">
                    {websites.map((website) => (
                      <button
                        key={website.value}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-analytics-gray-100 transition-colors duration-200"
                        onClick={() => {
                          setWebsiteFilter(website.value);
                          setShowWebsiteFilter(false);
                        }}
                      >
                        {website.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button className="btn-outline flex items-center px-3 py-2 text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Last 30 days</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <AnalyticsSummary />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VisitorsChart />
              <PerformanceMetrics />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TrafficSources />
              
              <div className="glass-card p-5 col-span-1 lg:col-span-2 animate-fade-in">
                <h3 className="text-lg font-semibold text-analytics-gray-900 mb-4">Top Pages</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-analytics-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-analytics-gray-500 uppercase tracking-wider">Page</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-analytics-gray-500 uppercase tracking-wider">Visitors</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-analytics-gray-500 uppercase tracking-wider">Page Views</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-analytics-gray-500 uppercase tracking-wider">Avg. Time</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-analytics-gray-500 uppercase tracking-wider">Bounce Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { page: '/home', visitors: 8241, views: 10432, time: '2:12', bounce: '32%' },
                        { page: '/products', visitors: 6389, views: 8954, time: '3:45', bounce: '28%' },
                        { page: '/about', visitors: 4128, views: 5621, time: '1:54', bounce: '45%' },
                        { page: '/blog', visitors: 3852, views: 6284, time: '4:21', bounce: '22%' },
                        { page: '/contact', visitors: 2914, views: 3526, time: '1:32', bounce: '51%' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-analytics-gray-200 hover:bg-analytics-gray-50 transition-colors duration-150">
                          <td className="px-4 py-3 text-sm text-analytics-gray-900 font-medium">{row.page}</td>
                          <td className="px-4 py-3 text-sm text-analytics-gray-600 text-right">{row.visitors.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-analytics-gray-600 text-right">{row.views.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-analytics-gray-600 text-right">{row.time}</td>
                          <td className="px-4 py-3 text-sm text-analytics-gray-600 text-right">{row.bounce}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
