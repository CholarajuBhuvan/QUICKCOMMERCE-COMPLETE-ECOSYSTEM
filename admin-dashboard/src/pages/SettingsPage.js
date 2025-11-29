import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CreditCardIcon,
  TruckIcon,
  UserIcon,
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock settings data
    const mockSettings = {
      general: {
        storeName: 'QuickMart',
        storeDescription: 'Your neighborhood grocery store with 10-minute delivery',
        email: 'admin@quickmart.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, City, State 12345',
        timezone: 'America/New_York',
        currency: 'USD',
        language: 'en'
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        orderAlerts: true,
        inventoryAlerts: true,
        staffAlerts: false,
        customerAlerts: true
      },
      delivery: {
        deliveryRadius: 5,
        deliveryFee: 2.99,
        freeDeliveryThreshold: 35.00,
        avgDeliveryTime: 10,
        maxDeliveryTime: 15,
        operatingHours: {
          start: '06:00',
          end: '22:00'
        }
      },
      payment: {
        stripeEnabled: true,
        paypalEnabled: false,
        cashOnDelivery: true,
        creditCards: true,
        digitalWallets: true
      },
      security: {
        twoFactorAuth: true,
        passwordExpiry: 90,
        sessionTimeout: 30,
        loginAttempts: 5
      }
    };

    setTimeout(() => {
      setSettings(mockSettings);
      setLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'delivery', name: 'Delivery', icon: TruckIcon },
    { id: 'payment', name: 'Payment', icon: CreditCardIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ];

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-48 mb-6"></div>
          <div className="flex space-x-6">
            <div className="w-64 bg-gray-200 h-96 rounded-lg"></div>
            <div className="flex-1 bg-gray-200 h-96 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your store configuration and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Name
                      </label>
                      <div className="relative">
                        <BuildingStorefrontIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={settings.general?.storeName || ''}
                          onChange={(e) => handleInputChange('general', 'storeName', e.target.value)}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={settings.general?.email || ''}
                          onChange={(e) => handleInputChange('general', 'email', e.target.value)}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={settings.general?.phone || ''}
                          onChange={(e) => handleInputChange('general', 'phone', e.target.value)}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.general?.timezone || ''}
                        onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Description
                    </label>
                    <textarea
                      rows={3}
                      value={settings.general?.storeDescription || ''}
                      onChange={(e) => handleInputChange('general', 'storeDescription', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        rows={2}
                        value={settings.general?.address || ''}
                        onChange={(e) => handleInputChange('general', 'address', e.target.value)}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                      { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
                      { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
                      { key: 'orderAlerts', label: 'Order Alerts', description: 'Get notified about new orders' },
                      { key: 'inventoryAlerts', label: 'Inventory Alerts', description: 'Get notified about low stock items' },
                      { key: 'staffAlerts', label: 'Staff Alerts', description: 'Get notified about staff activities' },
                      { key: 'customerAlerts', label: 'Customer Alerts', description: 'Get notified about customer activities' }
                    ].map((notification) => (
                      <div key={notification.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{notification.label}</h3>
                          <p className="text-sm text-gray-500">{notification.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications?.[notification.key] || false}
                            onChange={(e) => handleInputChange('notifications', notification.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Delivery Settings */}
            {activeTab === 'delivery' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Configuration</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Radius (miles)
                      </label>
                      <input
                        type="number"
                        value={settings.delivery?.deliveryRadius || ''}
                        onChange={(e) => handleInputChange('delivery', 'deliveryRadius', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Fee ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.delivery?.deliveryFee || ''}
                        onChange={(e) => handleInputChange('delivery', 'deliveryFee', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Free Delivery Threshold ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.delivery?.freeDeliveryThreshold || ''}
                        onChange={(e) => handleInputChange('delivery', 'freeDeliveryThreshold', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Average Delivery Time (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.delivery?.avgDeliveryTime || ''}
                        onChange={(e) => handleInputChange('delivery', 'avgDeliveryTime', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium text-gray-900 mb-4">Operating Hours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          value={settings.delivery?.operatingHours?.start || ''}
                          onChange={(e) => handleNestedInputChange('delivery', 'operatingHours', 'start', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          value={settings.delivery?.operatingHours?.end || ''}
                          onChange={(e) => handleNestedInputChange('delivery', 'operatingHours', 'end', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'stripeEnabled', label: 'Stripe', description: 'Accept credit and debit cards via Stripe' },
                      { key: 'paypalEnabled', label: 'PayPal', description: 'Accept payments via PayPal' },
                      { key: 'cashOnDelivery', label: 'Cash on Delivery', description: 'Accept cash payments on delivery' },
                      { key: 'creditCards', label: 'Credit Cards', description: 'Accept major credit cards' },
                      { key: 'digitalWallets', label: 'Digital Wallets', description: 'Accept Apple Pay, Google Pay, etc.' }
                    ].map((payment) => (
                      <div key={payment.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{payment.label}</h3>
                          <p className="text-sm text-gray-500">{payment.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.payment?.[payment.key] || false}
                            onChange={(e) => handleInputChange('payment', payment.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Configuration</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security?.twoFactorAuth || false}
                          onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Expiry (days)
                        </label>
                        <input
                          type="number"
                          value={settings.security?.passwordExpiry || ''}
                          onChange={(e) => handleInputChange('security', 'passwordExpiry', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          value={settings.security?.sessionTimeout || ''}
                          onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Login Attempts
                        </label>
                        <input
                          type="number"
                          value={settings.security?.loginAttempts || ''}
                          onChange={(e) => handleInputChange('security', 'loginAttempts', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
