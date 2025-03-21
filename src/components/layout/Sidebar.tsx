
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';
import { ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Globe2, 
  Users, 
  Settings, 
  HelpCircle,
  FileBarChart,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [marketingExpanded, setMarketingExpanded] = useState(false);
  const { signOut } = useAuth();

  // Classes conditionnelles basées sur l'état d'ouverture de la sidebar
  const sidebarClass = cn(
    "bg-white border-r border-analytics-gray-200 flex flex-col transition-all duration-300 z-10",
    isOpen ? "w-64" : "w-20"
  );

  // Classes pour les items du menu
  const getItemClass = (path: string) => {
    return cn(
      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
      location.pathname === path 
        ? "bg-analytics-blue/10 text-analytics-blue" 
        : "text-analytics-gray-700 hover:bg-analytics-gray-100",
      !isOpen && "justify-center px-0"
    );
  };

  const getItemIconClass = () => {
    return cn("h-5 w-5", !isOpen && "mx-auto");
  };

  return (
    <>
      {/* Overlay pour fermer le menu sur mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      
      {/* Bouton du menu mobile */}
      {isMobile && (
        <button 
          className="fixed top-4 left-4 z-30 bg-white rounded-md p-2 shadow-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-6 w-6 text-analytics-gray-800" />
        </button>
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          sidebarClass,
          isMobile && "fixed inset-y-0 left-0 transform z-30",
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-analytics-gray-200">
          <div className="flex items-center h-8">
            {isOpen ? (
              <div className="font-semibold text-xl text-analytics-blue">Analytics Pro</div>
            ) : (
              <div className="w-8 h-8 rounded-md bg-analytics-blue flex items-center justify-center text-white font-bold">
                A
              </div>
            )}
            
            {!isMobile && (
              <button 
                className="ml-auto text-analytics-gray-500 hover:text-analytics-gray-700"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
        
        {/* Menu items */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          <Link to="/dashboard" className={getItemClass("/dashboard")}>
            <LayoutDashboard className={getItemIconClass()} />
            {isOpen && <span className="ml-3">Dashboard</span>}
          </Link>
          
          <Link to="/analytics-reports" className={getItemClass("/analytics-reports")}>
            <FileBarChart className={getItemIconClass()} />
            {isOpen && <span className="ml-3">Rapports</span>}
          </Link>
          
          <Link to="/analytics-sources" className={getItemClass("/analytics-sources")}>
            <BarChart3 className={getItemIconClass()} />
            {isOpen && <span className="ml-3">Sources d'Analytics</span>}
          </Link>
          
          <div className={cn("px-3 py-2 text-xs font-semibold text-analytics-gray-500 uppercase", !isOpen && "text-center")}>
            {isOpen ? "Marketing" : "MKT"}
          </div>
          
          <button 
            className={cn(
              "w-full flex items-center px-4 py-3 text-sm font-medium rounded-md text-analytics-gray-700 hover:bg-analytics-gray-100 transition-colors",
              !isOpen && "justify-center px-0"
            )}
            onClick={() => setMarketingExpanded(!marketingExpanded)}
          >
            <Globe2 className={getItemIconClass()} />
            {isOpen && (
              <>
                <span className="ml-3 flex-1 text-left">Acquisition</span>
                {marketingExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            )}
          </button>
          
          {isOpen && marketingExpanded && (
            <div className="ml-6 space-y-1">
              <a href="#" className="block px-4 py-2 text-sm text-analytics-gray-600 hover:bg-analytics-gray-100 rounded-md">
                Campagnes
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-analytics-gray-600 hover:bg-analytics-gray-100 rounded-md">
                Canaux
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-analytics-gray-600 hover:bg-analytics-gray-100 rounded-md">
                Conversions
              </a>
            </div>
          )}
          
          <a href="#" className={getItemClass("")}>
            <Users className={getItemIconClass()} />
            {isOpen && <span className="ml-3">Audience</span>}
          </a>
        </nav>
        
        {/* Footer menu */}
        <div className="p-4 border-t border-analytics-gray-200 space-y-1">
          <a href="#" className={getItemClass("")}>
            <Settings className={getItemIconClass()} />
            {isOpen && <span className="ml-3">Paramètres</span>}
          </a>
          
          <a href="#" className={getItemClass("")}>
            <HelpCircle className={getItemIconClass()} />
            {isOpen && <span className="ml-3">Aide</span>}
          </a>

          <button 
            onClick={signOut}
            className={cn(
              "w-full flex items-center px-4 py-3 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors",
              !isOpen && "justify-center px-0"
            )}
          >
            <LogOut className={cn("h-5 w-5", !isOpen && "mx-auto")} />
            {isOpen && <span className="ml-3">Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
