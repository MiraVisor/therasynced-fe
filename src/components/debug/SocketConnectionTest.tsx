'use client';

import { useEffect, useState } from 'react';

import socketService from '@/services/socketService';

const SocketConnectionTest = () => {
  const [status, setStatus] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(socketService.getConnectionStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleConnect = () => {
    socketService.connect();
  };

  const handleDisconnect = () => {
    socketService.disconnect();
  };

  const handleForceReconnect = () => {
    socketService.forceReconnect();
  };

  const handleTestEndpoints = () => {
    socketService.testDifferentEndpoints();
  };

  const handleTestBasicConnection = () => {
    socketService.testBasicConnection();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      >
        Test Socket
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Socket Connection Test</h3>
        <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      {status && (
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium">Connected:</span>
            <span className={status.connected ? 'text-green-600' : 'text-red-600'}>
              {status.connected ? '✅' : '❌'}
            </span>

            <span className="font-medium">Socket Connected:</span>
            <span className={status.socketConnected ? 'text-green-600' : 'text-red-600'}>
              {status.socketConnected ? '✅' : '❌'}
            </span>

            <span className="font-medium">Socket ID:</span>
            <span className="text-gray-600">{status.socketId || 'N/A'}</span>

            <span className="font-medium">Reconnect Attempts:</span>
            <span className="text-gray-600">{status.reconnectAttempts}</span>

            <span className="font-medium">Initialized:</span>
            <span className={status.isInitialized ? 'text-green-600' : 'text-red-600'}>
              {status.isInitialized ? '✅' : '❌'}
            </span>

            <span className="font-medium">Has Token:</span>
            <span className={status.hasToken ? 'text-green-600' : 'text-red-600'}>
              {status.hasToken ? '✅' : '❌'}
            </span>
          </div>

          <div className="mt-4">
            <div className="font-medium">Backend URL:</div>
            <div className="text-gray-600 text-xs break-all">{status.backendUrl}</div>
          </div>

          <div className="mt-2">
            <div className="font-medium">Socket URL:</div>
            <div className="text-gray-600 text-xs break-all">{status.socketUrl}</div>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <button
          onClick={handleConnect}
          className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
        >
          Connect
        </button>

        <button
          onClick={handleDisconnect}
          className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Disconnect
        </button>

        <button
          onClick={handleForceReconnect}
          className="w-full bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
        >
          Force Reconnect
        </button>

        <button
          onClick={handleTestEndpoints}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          Test All Endpoints
        </button>

        <button
          onClick={handleTestBasicConnection}
          className="w-full bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
        >
          Test Basic Connection
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Check browser console for detailed logs</p>
      </div>
    </div>
  );
};

export default SocketConnectionTest;
