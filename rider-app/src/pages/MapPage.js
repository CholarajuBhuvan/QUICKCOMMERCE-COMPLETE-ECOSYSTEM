import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  TruckIcon,
  ArrowPathIcon,
  HomeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { fetchMyDeliveries, selectMyDeliveries } from '../store/slices/deliveriesSlice';
import { selectCurrentLocation } from '../store/slices/authSlice';

const MapPage = () => {
  const dispatch = useDispatch();
  const deliveries = useSelector(selectMyDeliveries);
  const currentLocation = useSelector(selectCurrentLocation);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });

  useEffect(() => {
    dispatch(fetchMyDeliveries());
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [dispatch]);

  const activeDeliveries = deliveries.filter(
    d => ['assigned', 'picked_up', 'in_transit'].includes(d.status)
  );

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Map Container - Placeholder */}
      <div className="flex-1 relative bg-gray-100">
        {/* Map Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <MapPinIcon className="mx-auto h-16 w-16 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Interactive Map
            </h3>
            <p className="text-gray-600 mb-4">
              Real-time delivery tracking map would appear here.
              Requires Mapbox or Google Maps API integration.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>📍 Your Location: {currentLocation ? 
                `${currentLocation.lat?.toFixed(4)}, ${currentLocation.lng?.toFixed(4)}` : 
                'Detecting...'}
              </p>
              <p>🚚 Active Deliveries: {activeDeliveries.length}</p>
            </div>
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <button
            className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            title="Center on current location"
          >
            <ArrowPathIcon className="h-6 w-6 text-gray-700" />
          </button>
          <button
            className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            title="Go to warehouse"
          >
            <HomeIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Delivery List Sidebar */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Active Deliveries
          </h2>
          
          {activeDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600">No active deliveries</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeDeliveries.map((delivery) => (
                <motion.div
                  key={delivery._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedDelivery?._id === delivery._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDelivery(delivery)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Order #{delivery.orderId?.slice(-8)}
                      </h3>
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {delivery.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <TruckIcon className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-start">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                      <p className="text-gray-700 flex-1">
                        {delivery.deliveryAddress?.street}
                      </p>
                    </div>
                    {delivery.distance && (
                      <p className="text-gray-500 ml-6">
                        {delivery.distance.toFixed(1)} km away
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {delivery.items?.length || 0} items
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      ${delivery.deliveryFee?.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Delivery Details */}
        {selectedDelivery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-gray-200 p-6 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Delivery Details</h3>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 font-medium">Customer</p>
                <p className="text-gray-900">{selectedDelivery.customer?.name}</p>
                <p className="text-gray-600">{selectedDelivery.customer?.phone}</p>
              </div>

              <div>
                <p className="text-gray-600 font-medium">Address</p>
                <p className="text-gray-900">{selectedDelivery.deliveryAddress?.street}</p>
                <p className="text-gray-600">
                  {selectedDelivery.deliveryAddress?.city}, {selectedDelivery.deliveryAddress?.zipCode}
                </p>
              </div>

              {selectedDelivery.deliveryAddress?.instructions && (
                <div>
                  <p className="text-gray-600 font-medium">Delivery Instructions</p>
                  <p className="text-gray-700 italic">
                    {selectedDelivery.deliveryAddress.instructions}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedDelivery.deliveryAddress?.street}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Get Directions
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
