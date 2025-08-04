'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/redux/store';
import socketService from '@/services/socketService';

interface SocketEvent {
  type: string;
  timestamp: Date;
  data: any;
}

const SocketDebugger = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [events, setEvents] = useState<SocketEvent[]>([]);
  const [slotDetails, setSlotDetails] = useState<any>(null);
  const { slots } = useSelector((state: RootState) => state.overview);

  useEffect(() => {
    // Listen for socket events
    const handleSlotStatusUpdated = (event: CustomEvent) => {
      addEvent('slot-status-updated', event.detail);
    };

    const handleMultipleSlotsUpdated = (event: CustomEvent) => {
      addEvent('multiple-slots-updated', event.detail);
    };

    const handleSlotReserved = (event: CustomEvent) => {
      addEvent('slot-reserved', event.detail);
    };

    window.addEventListener('slot-status-updated', handleSlotStatusUpdated as EventListener);
    window.addEventListener('multiple-slots-updated', handleMultipleSlotsUpdated as EventListener);
    window.addEventListener('slot-reserved', handleSlotReserved as EventListener);

    return () => {
      window.removeEventListener('slot-status-updated', handleSlotStatusUpdated as EventListener);
      window.removeEventListener(
        'multiple-slots-updated',
        handleMultipleSlotsUpdated as EventListener,
      );
      window.removeEventListener('slot-reserved', handleSlotReserved as EventListener);
    };
  }, []);

  const addEvent = (type: string, data: any) => {
    setEvents((prev) => [
      { type, timestamp: new Date(), data },
      ...prev.slice(0, 49), // Keep only last 50 events
    ]);
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const refreshSlots = () => {
    addEvent('manual-refresh', { message: 'Manual refresh triggered' });
  };

  const testNamespaces = () => {
    const namespaces = ['', '/slots', '/socket', '/ws', '/realtime', '/events'];
    namespaces.forEach((namespace) => {
      setTimeout(() => {
        socketService.testNamespace(namespace);
      }, 1000);
    });
  };

  const getConnectionStatus = () => {
    return socketService.getConnectionStatus();
  };

  const forceReconnect = () => {
    socketService.forceReconnect();
    addEvent('force-reconnect', { message: 'Force reconnect triggered' });
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-50"
        title="Debug Socket"
      >
        🔧
      </button>
    );
  }

  const status = getConnectionStatus();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Socket Debugger</h3>
        <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      {/* Connection Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Connection Status</h4>
        <div className="text-sm space-y-1">
          <div>Connected: {status.connected ? '✅' : '❌'}</div>
          <div>Socket Connected: {status.socketConnected ? '✅' : '❌'}</div>
          <div>Socket ID: {status.socketId || 'N/A'}</div>
          <div>Backend URL: {status.backendUrl || 'Not set'}</div>
          <div>Has Token: {status.hasToken ? '✅' : '❌'}</div>
          <div>Reconnect Attempts: {status.reconnectAttempts}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-4 space-y-2">
        <button
          onClick={forceReconnect}
          className="w-full bg-blue-500 text-white p-2 rounded text-sm"
        >
          Force Reconnect
        </button>
        <button
          onClick={testNamespaces}
          className="w-full bg-green-500 text-white p-2 rounded text-sm"
        >
          Test Namespaces
        </button>
        <button
          onClick={refreshSlots}
          className="w-full bg-yellow-500 text-white p-2 rounded text-sm"
        >
          Refresh Slots
        </button>
        <button onClick={clearEvents} className="w-full bg-red-500 text-white p-2 rounded text-sm">
          Clear Events
        </button>
      </div>

      {/* Events */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Recent Events ({events.length})</h4>
        <div className="max-h-32 overflow-y-auto text-xs space-y-1">
          {events.map((event, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded">
              <div className="font-medium">{event.type}</div>
              <div className="text-gray-600">{event.timestamp.toLocaleTimeString()}</div>
              <div className="text-gray-500 truncate">
                {JSON.stringify(event.data).substring(0, 100)}
                {JSON.stringify(event.data).length > 100 && '...'}
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-gray-500 text-center py-4">No events yet</div>
          )}
        </div>
      </div>

      {/* Slot Summary */}
      <div>
        <h4 className="font-medium mb-2">Slot Summary</h4>
        <div className="text-sm">
          <div>Total Slots: {slots?.length || 0}</div>
          <div>Available: {slots?.filter((s: any) => s.status === 'AVAILABLE').length || 0}</div>
          <div>Reserved: {slots?.filter((s: any) => s.status === 'RESERVED').length || 0}</div>
          <div>Booked: {slots?.filter((s: any) => s.status === 'BOOKED').length || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default SocketDebugger;
