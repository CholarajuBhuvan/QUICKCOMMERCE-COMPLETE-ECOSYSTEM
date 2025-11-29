import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCodeIcon,
  CameraIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LightBulbIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import jsQR from 'jsqr';

import { scanQRCode, selectScannedBin, selectScanLoading, selectScanError } from '../store/slices/binSlice';
import { findProductLocation } from '../store/slices/binSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const QRScannerPage = () => {
  const dispatch = useDispatch();
  const scannedBin = useSelector(selectScannedBin);
  const scanLoading = useSelector(selectScanLoading);
  const scanError = useSelector(selectScanError);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    // Load scan history from localStorage
    const savedHistory = localStorage.getItem('picker_scan_history');
    if (savedHistory) {
      try {
        setScanHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load scan history:', error);
      }
    }

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsScanning(true);
      setHasCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        
        // Start scanning loop
        const scanLoop = () => {
          if (videoRef.current && canvasRef.current && isScanning) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (video.readyState === video.HAVE_ENOUGH_DATA) {
              canvas.height = video.videoHeight;
              canvas.width = video.videoWidth;
              context.drawImage(video, 0, 0, canvas.width, canvas.height);

              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height);

              if (code) {
                handleQRCodeDetected(code.data);
                return;
              }
            }
            requestAnimationFrame(scanLoop);
          }
        };
        scanLoop();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCamera(false);
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleQRCodeDetected = async (qrData) => {
    stopScanning();
    setScanResult({ data: qrData, timestamp: new Date() });
    
    // Add to scan history
    const newHistoryEntry = {
      id: Date.now(),
      data: qrData,
      timestamp: new Date().toISOString(),
      type: 'qr_scan'
    };
    
    const updatedHistory = [newHistoryEntry, ...scanHistory.slice(0, 9)]; // Keep last 10
    setScanHistory(updatedHistory);
    localStorage.setItem('picker_scan_history', JSON.stringify(updatedHistory));

    // Process the QR code
    try {
      await dispatch(scanQRCode(qrData)).unwrap();
      toast.success('QR code scanned successfully!');
    } catch (error) {
      toast.error('Failed to process QR code');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setScanResult({ data: manualCode.trim(), timestamp: new Date() });
    
    // Add to scan history
    const newHistoryEntry = {
      id: Date.now(),
      data: manualCode.trim(),
      timestamp: new Date().toISOString(),
      type: 'manual_entry'
    };
    
    const updatedHistory = [newHistoryEntry, ...scanHistory.slice(0, 9)];
    setScanHistory(updatedHistory);
    localStorage.setItem('picker_scan_history', JSON.stringify(updatedHistory));

    try {
      await dispatch(scanQRCode(manualCode.trim())).unwrap();
      setManualCode('');
      toast.success('Code processed successfully!');
    } catch (error) {
      toast.error('Failed to process code');
    }
  };

  const toggleFlash = async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled }]
          });
          setFlashEnabled(!flashEnabled);
        } catch (error) {
          toast.error('Flash not supported on this device');
        }
      } else {
        toast.error('Flash not supported on this device');
      }
    }
  };

  const clearResults = () => {
    setScanResult(null);
    dispatch({ type: 'bins/clearScannedBin' });
  };

  const rescanFromHistory = async (historyItem) => {
    try {
      await dispatch(scanQRCode(historyItem.data)).unwrap();
      setScanResult({ data: historyItem.data, timestamp: new Date(historyItem.timestamp) });
      toast.success('Code rescanned successfully!');
    } catch (error) {
      toast.error('Failed to process code');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <QrCodeIcon className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">QR Code Scanner</h1>
        <p className="text-gray-600">
          Scan bin QR codes or enter codes manually to locate items
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Camera Scanner</h2>
          
          {!hasCamera ? (
            <div className="text-center py-8">
              <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Camera not available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please check camera permissions or use manual entry below.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera View */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Scan Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-green-400 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                      
                      {/* Scanning line animation */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-green-400 shadow-green-400 shadow-sm"
                        animate={{ y: [0, 256, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Loading overlay */}
                {scanLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <LoadingSpinner size="lg" color="white" text="Processing..." />
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex justify-center space-x-4">
                {!isScanning ? (
                  <button
                    onClick={startScanning}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <CameraIcon className="h-5 w-5 mr-2" />
                    Start Scanning
                  </button>
                ) : (
                  <>
                    <button
                      onClick={stopScanning}
                      className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Stop
                    </button>
                    
                    <button
                      onClick={toggleFlash}
                      className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                        flashEnabled
                          ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <LightBulbIcon className="h-4 w-4 mr-2" />
                      Flash
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Manual Entry Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Manual Entry</h2>
          
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter QR Code or Bin ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., BIN-A1-B3 or QR code data"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!manualCode.trim() || scanLoading}
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scanLoading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                <>
                  <QrCodeIcon className="h-5 w-5 mr-2" />
                  Process Code
                </>
              )}
            </button>
          </form>

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Scans</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => rescanFromHistory(item)}
                  >
                    <div className="flex-1 truncate">
                      <span className="font-mono">{item.data}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({item.type === 'qr_scan' ? 'Scanned' : 'Manual'})
                      </span>
                    </div>
                    <ArrowPathIcon className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {(scanResult || scannedBin || scanError) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Scan Results</h2>
              <button
                onClick={clearResults}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {scanError ? (
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-900">Scan Error</h3>
                  <p className="text-sm text-red-700 mt-1">{scanError}</p>
                  {scanResult && (
                    <p className="text-xs text-red-600 mt-2 font-mono">
                      Code: {scanResult.data}
                    </p>
                  )}
                </div>
              </div>
            ) : scannedBin ? (
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-green-900">Bin Found!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Successfully located bin: <span className="font-mono">{scannedBin.binCode}</span>
                    </p>
                  </div>
                </div>

                {/* Bin Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Bin Information</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-500">Code:</span> {scannedBin.binCode}</p>
                      <p><span className="text-gray-500">Type:</span> {scannedBin.binType}</p>
                      <p><span className="text-gray-500">Zone:</span> {scannedBin.location?.zone}</p>
                      <p><span className="text-gray-500">Aisle:</span> {scannedBin.location?.aisle}</p>
                      <p><span className="text-gray-500">Position:</span> {scannedBin.location?.position}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Current Stock</h4>
                    <div className="text-sm">
                      {scannedBin.currentStock && scannedBin.currentStock.length > 0 ? (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {scannedBin.currentStock.map((stock, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="truncate">{stock.product?.name || 'Product'}</span>
                              <span className="font-medium">{stock.quantity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No items in this bin</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Link
                    to={`/bins/${scannedBin._id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    View Bin Details
                  </Link>
                  <Link
                    to="/bins"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    All Bins
                  </Link>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRScannerPage;
