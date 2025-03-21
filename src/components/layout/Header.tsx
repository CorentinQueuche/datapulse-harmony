
import React from 'react';
import { Bell, ChevronDown, Search, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="bg-white border-b border-analytics-gray-200 py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="animate-slide-up-fade">
          <h1 className="text-2xl font-semibold text-analytics-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-analytics-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-analytics-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-md border border-analytics-gray-200 focus:outline-none focus:ring-2 focus:ring-analytics-blue focus:border-transparent text-sm transition-all duration-200"
            />
          </div>
          
          <div className="relative">
            <button className="relative p-2 rounded-full hover:bg-analytics-gray-100 transition-colors duration-200">
              <Bell className="h-5 w-5 text-analytics-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-analytics-blue rounded-full"></span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-analytics-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-analytics-gray-600" />
            </div>
            <button className="flex items-center text-sm text-analytics-gray-700 hover:text-analytics-gray-900">
              <span>User</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
