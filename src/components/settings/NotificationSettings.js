"use client";

import React, { useState } from 'react';

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketAlerts: true,
    promotionalEmails: false
  });

  const handleToggle = (setting) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Email Notifications
        </span>
        <button
          type="button"
          onClick={() => handleToggle('emailNotifications')}
          className={`
            ${notifications.emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'}
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer 
            rounded-full border-2 border-transparent transition-colors 
            duration-200 ease-in-out focus:outline-none focus:ring-2 
            focus:ring-indigo-500 focus:ring-offset-2
          `}
        >
          <span
            className={`
              ${notifications.emailNotifications ? 'translate-x-5' : 'translate-x-0'}
              pointer-events-none relative inline-block h-5 w-5 
              transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
            `}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Push Notifications
        </span>
        <button
          type="button"
          onClick={() => handleToggle('pushNotifications')}
          className={`
            ${notifications.pushNotifications ? 'bg-indigo-600' : 'bg-gray-200'}
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer 
            rounded-full border-2 border-transparent transition-colors 
            duration-200 ease-in-out focus:outline-none focus:ring-2 
            focus:ring-indigo-500 focus:ring-offset-2
          `}
        >
          <span
            className={`
              ${notifications.pushNotifications ? 'translate-x-5' : 'translate-x-0'}
              pointer-events-none relative inline-block h-5 w-5 
              transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
            `}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Market Alerts
        </span>
        <button
          type="button"
          onClick={() => handleToggle('marketAlerts')}
          className={`
            ${notifications.marketAlerts ? 'bg-indigo-600' : 'bg-gray-200'}
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer 
            rounded-full border-2 border-transparent transition-colors 
            duration-200 ease-in-out focus:outline-none focus:ring-2 
            focus:ring-indigo-500 focus:ring-offset-2
          `}
        >
          <span
            className={`
              ${notifications.marketAlerts ? 'translate-x-5' : 'translate-x-0'}
              pointer-events-none relative inline-block h-5 w-5 
              transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
            `}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Promotional Emails
        </span>
        <button
          type="button"
          onClick={() => handleToggle('promotionalEmails')}
          className={`
            ${notifications.promotionalEmails ? 'bg-indigo-600' : 'bg-gray-200'}
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer 
            rounded-full border-2 border-transparent transition-colors 
            duration-200 ease-in-out focus:outline-none focus:ring-2 
            focus:ring-indigo-500 focus:ring-offset-2
          `}
        >
          <span
            className={`
              ${notifications.promotionalEmails ? 'translate-x-5' : 'translate-x-0'}
              pointer-events-none relative inline-block h-5 w-5 
              transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
            `}
          />
        </button>
      </div>
    </div>
  );
}

