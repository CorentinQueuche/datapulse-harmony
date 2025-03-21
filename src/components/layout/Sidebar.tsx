
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart2, Home, Settings, PieChart, Database, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  
  const isActiveRoute = (route: string) => {
    return location.pathname === route;
  };
  
  const navItems = [
    { icon: Home, label: 'Accueil', route: '/' },
    { icon: BarChart2, label: 'Dashboard', route: '/dashboard' },
    { icon: Database, label: 'Sources', route: '/analytics-sources' },
    { icon: PieChart, label: 'Rapports', route: '/reports' },
    { icon: Settings, label: 'Paramètres', route: '/settings' },
  ];
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex-shrink-0 hidden md:block">
      <div className="h-full flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-analytics-gray-900">Analytics Pro</h1>
        </div>
        
        <nav className="flex-1 py-5 px-3 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.route}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-md",
                  isActiveRoute(item.route)
                    ? "bg-analytics-blue text-white"
                    : "text-analytics-gray-700 hover:bg-analytics-gray-100"
                )}
              >
                <Icon className={cn(
                  "mr-3 h-5 w-5",
                  isActiveRoute(item.route)
                    ? "text-white"
                    : "text-analytics-gray-400"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-5 border-t border-gray-200">
          <button
            onClick={() => signOut()}
            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-analytics-gray-700 hover:bg-analytics-gray-100 w-full"
          >
            <LogOut className="mr-3 h-5 w-5 text-analytics-gray-400" />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
