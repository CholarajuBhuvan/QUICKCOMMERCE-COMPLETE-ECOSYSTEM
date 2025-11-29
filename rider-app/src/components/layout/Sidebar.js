import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  TruckIcon,
  MapIcon,
  CurrencyDollarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  TruckIcon as TruckIconSolid,
  MapIcon as MapIconSolid,
  CurrencyDollarIcon as DollarIconSolid,
  UserCircleIcon as UserIconSolid
} from '@heroicons/react/24/solid';

const Sidebar = () => {
  const navigation = [
    {
      name: 'Dashboard',
      path: '/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid
    },
    {
      name: 'Deliveries',
      path: '/deliveries',
      icon: TruckIcon,
      activeIcon: TruckIconSolid
    },
    {
      name: 'Map',
      path: '/map',
      icon: MapIcon,
      activeIcon: MapIconSolid
    },
    {
      name: 'Earnings',
      path: '/earnings',
      icon: CurrencyDollarIcon,
      activeIcon: DollarIconSolid
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: UserCircleIcon,
      activeIcon: UserIconSolid
    }
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TruckIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">QuickMart Rider</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => {
              const Icon = isActive ? item.activeIcon : item.icon;
              return (
                <>
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span>{item.name}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <UserCircleIcon className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Rider</p>
            <p className="text-xs text-gray-500 truncate">Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
