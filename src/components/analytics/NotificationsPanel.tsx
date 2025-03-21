
import React from 'react';
import { Bell, ArrowUp, ArrowDown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationProps {
  title: string;
  description: string;
  timestamp: string;
  type: 'info' | 'positive' | 'negative' | 'warning';
}

const Notification: React.FC<NotificationProps> = ({ 
  title, 
  description, 
  timestamp, 
  type 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'positive':
        return <ArrowUp className="h-5 w-5 text-analytics-success" />;
      case 'negative':
        return <ArrowDown className="h-5 w-5 text-analytics-error" />;
      case 'warning':
        return <Zap className="h-5 w-5 text-analytics-warning" />;
      default:
        return <Bell className="h-5 w-5 text-analytics-blue" />;
    }
  };
  
  const getBgColor = () => {
    switch (type) {
      case 'positive':
        return 'bg-analytics-success/10';
      case 'negative':
        return 'bg-analytics-error/10';
      case 'warning':
        return 'bg-analytics-warning/10';
      default:
        return 'bg-analytics-blue/10';
    }
  };
  
  return (
    <div className="flex items-start p-4 border-b border-analytics-gray-200 last:border-b-0 hover:bg-analytics-gray-50 transition-colors duration-200">
      <div className={cn("p-2 rounded-full mr-3", getBgColor())}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-analytics-gray-900">{title}</h4>
        <p className="text-xs text-analytics-gray-600 mt-1">{description}</p>
        <span className="text-xs text-analytics-gray-400 mt-2 block">{timestamp}</span>
      </div>
    </div>
  );
};

const NotificationsPanel: React.FC = () => {
  const notifications = [
    {
      id: 1,
      title: 'Pic de trafic détecté',
      description: 'Votre site a connu une augmentation de 45% du trafic par rapport à la semaine dernière.',
      timestamp: 'Il y a 2 heures',
      type: 'positive' as const,
    },
    {
      id: 2,
      title: 'Baisse du taux de conversion',
      description: 'Le taux de conversion a chuté de 12% sur la page de produit principale.',
      timestamp: 'Il y a 5 heures',
      type: 'negative' as const,
    },
    {
      id: 3,
      title: 'Objectif atteint',
      description: 'Vous avez atteint votre objectif mensuel de 10 000 visiteurs.',
      timestamp: 'Hier',
      type: 'info' as const,
    },
    {
      id: 4,
      title: 'Temps de chargement élevé',
      description: 'Votre page d\'accueil présente un temps de chargement inhabituellement long.',
      timestamp: 'Il y a 2 jours',
      type: 'warning' as const,
    },
  ];
  
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-analytics-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-analytics-gray-900">Notifications</h3>
        <span className="text-xs text-white bg-analytics-blue px-2 py-1 rounded-full">4 nouvelles</span>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        {notifications.map((notification) => (
          <Notification 
            key={notification.id} 
            title={notification.title} 
            description={notification.description} 
            timestamp={notification.timestamp} 
            type={notification.type} 
          />
        ))}
      </div>
      <div className="p-3 border-t border-analytics-gray-200 text-center">
        <button className="text-sm text-analytics-blue hover:underline">
          Voir toutes les notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationsPanel;
