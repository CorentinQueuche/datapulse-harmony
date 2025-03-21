
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  LineChart, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  Database,
  FileBarChart
} from 'lucide-react';

interface SidebarProps {
  isMenuOpen?: boolean;
  toggleMenu?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isMenuOpen = false, 
  toggleMenu = () => {} 
}) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  const sidebarItems = [
    {
      path: '/dashboard',
      label: 'Tableau de bord',
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      path: '/analytics-sources',
      label: 'Sources Analytics',
      icon: <Database className="h-4 w-4 mr-2" />,
    },
    {
      path: '/analytics-reports',
      label: 'Rapports Analytics',
      icon: <FileBarChart className="h-4 w-4 mr-2" />,
    },
    {
      path: '/users',
      label: 'Utilisateurs',
      icon: <Users className="h-4 w-4 mr-2" />,
    },
    {
      path: '/settings',
      label: 'Paramètres',
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <aside
      className={`
        ${isMobile ? 'fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300' : 'hidden lg:flex flex-col h-screen w-72 bg-white border-r'}
        ${isMobile ? (isMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'flex'}
      `}
    >
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="flex items-center text-lg font-semibold">
          <LineChart className="h-6 w-6 mr-2 text-analytics-blue" />
          <span>Datapulse</span>
        </Link>
        {isMobile && (
          <Button variant="ghost" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        )}
      </div>

      <nav className="flex-1 px-2 py-4">
        {sidebarItems.map((item) => (
          <Link
            to={item.path}
            key={item.path}
            className={`flex items-center px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 ${location.pathname === item.path ? 'bg-gray-100 text-gray-900 font-medium' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <Separator />

      <div className="p-4">
        <div className="text-sm text-gray-500">Connecté en tant que</div>
        <div className="font-medium text-gray-700">{user?.email}</div>
        <Button variant="ghost" className="mt-2 w-full justify-start" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
