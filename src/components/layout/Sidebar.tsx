
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  Globe, 
  Home, 
  LayoutDashboard, 
  LineChart, 
  MessageSquare, 
  PieChart, 
  Settings, 
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarProps = {
  className?: string;
};

const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Visitors', path: '/visitors', icon: Users },
    { name: 'Traffic Sources', path: '/traffic', icon: Compass },
    { name: 'Geography', path: '/geography', icon: Globe },
    { name: 'Behavior', path: '/behavior', icon: MessageSquare },
    { name: 'Performance', path: '/performance', icon: LineChart },
    { name: 'Conversions', path: '/conversions', icon: PieChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={cn(
        "relative h-screen bg-white border-r border-analytics-gray-200 transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[240px]",
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-analytics-gray-200">
        <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
          {!collapsed && (
            <span className="font-semibold text-lg text-analytics-blue ml-2">DataPulse</span>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-md bg-analytics-blue flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-analytics-gray-100 transition-colors duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-analytics-gray-500" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-analytics-gray-500" />
          )}
        </button>
      </div>

      <div className="py-4 px-3 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "nav-link group flex items-center py-2.5 px-3 rounded-md transition-all duration-200",
                isActive 
                  ? "bg-analytics-blue bg-opacity-10 text-analytics-blue font-medium" 
                  : "text-analytics-gray-600 hover:bg-analytics-gray-100 hover:text-analytics-blue",
                collapsed ? "justify-center" : ""
              )}
            >
              <item.icon className={cn(
                "flex-shrink-0 w-5 h-5",
                collapsed ? "ml-0" : "mr-3"
              )} />
              {!collapsed && <span>{item.name}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-analytics-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
