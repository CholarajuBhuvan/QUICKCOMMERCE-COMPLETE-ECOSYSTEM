import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentListIcon as ClipboardIconSolid,
  ClockIcon as ClockIconSolid,
  UserCircleIcon as UserIconSolid
} from '@heroicons/react/24/solid';

const BottomNav = () => {
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid
    },
    {
      name: 'Orders',
      path: '/orders',
      icon: ClipboardDocumentListIcon,
      activeIcon: ClipboardIconSolid
    },
    {
      name: 'History',
      path: '/history',
      icon: ClockIcon,
      activeIcon: ClockIconSolid
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: UserCircleIcon,
      activeIcon: UserIconSolid
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`
            }
          >
            {({ isActive }) => {
              const Icon = isActive ? item.activeIcon : item.icon;
              return (
                <>
                  <Icon className="h-6 w-6" />
                  <span className="text-xs mt-1 font-medium">{item.name}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
