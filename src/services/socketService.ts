import { Socket, io } from 'socket.io-client';

import { getCookie } from '@/lib/utils';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isInitialized = false;

  constructor() {
    // Don't initialize immediately - wait for connect() call
  }

  private initializeSocket() {
    if (this.isInitialized) return;

    const token = getCookie('token');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    // Check if we have the required configuration
    if (!backendUrl) {
      console.error('SocketService: NEXT_PUBLIC_BACKEND_URL is not defined');
      return;
    }

    if (!token) {
      console.warn('SocketService: No authentication token found');
    }

    // Extract the base domain from the API URL
    // Convert https://backend.mehadnadeem.com/api/v1 to https://backend.mehadnadeem.com
    let baseUrl: string;
    if (backendUrl.includes('/api/v1')) {
      baseUrl = backendUrl.split('/api/v1')[0];
    } else {
      baseUrl = backendUrl;
    }

    // Convert HTTP URL to WebSocket URL
    let socketUrl: string;
    if (baseUrl.startsWith('https://')) {
      // Convert https:// to wss:// for WebSocket connection
      socketUrl = baseUrl.replace('https://', 'wss://');
    } else if (baseUrl.startsWith('http://')) {
      // Convert http:// to ws:// for WebSocket connection
      socketUrl = baseUrl.replace('http://', 'ws://');
    } else {
      // If no protocol specified, assume wss:// for production
      socketUrl = `wss://${baseUrl}`;
    }

    console.log('SocketService: Initializing socket connection to:', socketUrl);
    console.log('SocketService: Original backend URL:', backendUrl);
    console.log('SocketService: Base URL:', baseUrl);

    // Connect to the /slots namespace to match backend SlotGateway
    const socketUrlWithNamespace = `${socketUrl}/slots`;
    console.log('SocketService: Connecting to namespace:', socketUrlWithNamespace);

    this.socket = io(socketUrlWithNamespace, {
      auth: {
        token: token || '',
      },
      transports: ['websocket', 'polling'],
      autoConnect: false,
      timeout: 20000, // 20 second timeout
      forceNew: true,
    });

    this.setupEventListeners();
    this.isInitialized = true;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('SocketService: Connected to socket, ID:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('SocketService: Disconnected from socket, reason:', reason);
      this.isConnected = false;

      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        console.log('SocketService: Server disconnected, attempting to reconnect...');
        setTimeout(() => {
          this.socket?.connect();
        }, 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('SocketService: Connection error:', error);
      console.error('SocketService: Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      this.isConnected = false;

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts); // Exponential backoff
        console.log(
          `SocketService: Attempting reconnect ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts} in ${delay}ms`,
        );

        setTimeout(() => {
          this.reconnectAttempts++;
          this.socket?.connect();
        }, delay);
      } else {
        console.error('SocketService: Max reconnection attempts reached');
        console.error('SocketService: Please check:');
        console.error('1. Backend WebSocket server is running');
        console.error('2. WebSocket endpoint is correct');
        console.error('3. CORS is properly configured');
        console.error('4. Authentication token is valid');
      }
    });

    // Slot status updates
    this.socket.on('slot-status-updated', (data) => {
      console.log('SocketService: Slot status updated:', data);
      window.dispatchEvent(new CustomEvent('slot-status-updated', { detail: data }));
    });

    // Multiple slots updated
    this.socket.on('multiple-slots-updated', (data) => {
      console.log('SocketService: Multiple slots updated:', data);
      window.dispatchEvent(new CustomEvent('multiple-slots-updated', { detail: data }));
    });

    // Slot reserved
    this.socket.on('slot-reserved', (data) => {
      console.log('SocketService: Slot reserved:', data);
      window.dispatchEvent(new CustomEvent('slot-reserved', { detail: data }));
    });

    // Slot reservation confirmed (from WebSocket handler)
    this.socket.on('slot-reservation-confirmed', (data) => {
      console.log('SocketService: Slot reservation confirmed:', data);
      window.dispatchEvent(new CustomEvent('slot-reservation-confirmed', { detail: data }));
    });

    // Slot reservation failed (from WebSocket handler)
    this.socket.on('slot-reservation-failed', (data) => {
      console.log('SocketService: Slot reservation failed:', data);
      window.dispatchEvent(new CustomEvent('slot-reservation-failed', { detail: data }));
    });

    // NEW: Slot booked (removed from available list)
    this.socket.on('slot-booked', (data) => {
      console.log('SocketService: Slot booked:', data);
      window.dispatchEvent(new CustomEvent('slot-booked', { detail: data }));
    });

    // NEW: Slot removed from available list
    this.socket.on('slot-removed', (data) => {
      console.log('SocketService: Slot removed:', data);
      window.dispatchEvent(new CustomEvent('slot-removed', { detail: data }));
    });

    // Slot released
    this.socket.on('slot-released', (data) => {
      console.log('SocketService: Slot released:', data);
      window.dispatchEvent(new CustomEvent('slot-released', { detail: data }));
    });

    // Slot release failed
    this.socket.on('slot-release-failed', (data) => {
      console.log('SocketService: Slot release failed:', data);
      window.dispatchEvent(new CustomEvent('slot-release-failed', { detail: data }));
    });

    // Room join/leave acknowledgments
    this.socket.on('joined-freelancer-slots', (data) => {
      console.log('SocketService: Joined freelancer slots room:', data);
    });

    this.socket.on('left-freelancer-slots', (data) => {
      console.log('SocketService: Left freelancer slots room:', data);
    });
  }

  public connect() {
    console.log('SocketService: connect() called');

    // Initialize if not already done
    if (!this.isInitialized) {
      this.initializeSocket();
    }

    if (!this.socket) {
      console.error('SocketService: Socket not initialized');
      return;
    }

    if (!this.isConnected) {
      console.log('SocketService: Attempting to connect...');
      this.socket.connect();
    } else {
      console.log('SocketService: Already connected');
    }
  }

  public disconnect() {
    console.log('SocketService: disconnect() called');

    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.isInitialized = false;
    }
  }

  public joinFreelancerSlots(freelancerId: string) {
    if (this.socket && this.isConnected) {
      console.log(`SocketService: Joining freelancer slots room: ${freelancerId}`);
      this.socket.emit('join-freelancer-slots', { freelancerId });
    } else {
      console.warn(`SocketService: Cannot join room ${freelancerId} - socket not connected`);
    }
  }

  public leaveFreelancerSlots(freelancerId: string) {
    if (this.socket && this.isConnected) {
      console.log(`SocketService: Leaving freelancer slots room: ${freelancerId}`);
      this.socket.emit('leave-freelancer-slots', { freelancerId });
    } else {
      console.warn(`SocketService: Cannot leave room ${freelancerId} - socket not connected`);
    }
  }

  public reserveSlot(slotId: string, duration: number = 300000) {
    // 5 minutes default
    if (this.socket && this.isConnected) {
      console.log(`SocketService: Reserving slot: ${slotId} for ${duration}ms`);
      this.socket.emit('reserve-slot', {
        slotId,
        duration,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error('SocketService: Cannot reserve slot - socket not connected');
    }
  }

  public releaseSlot(slotId: string) {
    if (this.socket && this.isConnected) {
      console.log(`SocketService: Releasing slot: ${slotId}`);
      this.socket.emit('release-slot', { slotId });
    } else {
      console.error('SocketService: Cannot release slot - socket not connected');
    }
  }

  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  // Debug methods
  public getConnectionStatus() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    let socketUrl = '';

    if (backendUrl) {
      // Extract the base domain from the API URL
      let baseUrl: string;
      if (backendUrl.includes('/api/v1')) {
        baseUrl = backendUrl.split('/api/v1')[0];
      } else {
        baseUrl = backendUrl;
      }

      if (baseUrl.startsWith('https://')) {
        socketUrl = baseUrl.replace('https://', 'wss://');
      } else if (baseUrl.startsWith('http://')) {
        socketUrl = baseUrl.replace('http://', 'ws://');
      } else {
        socketUrl = `wss://${baseUrl}`;
      }

      // Add namespace
      socketUrl = `${socketUrl}/slots`;
    }

    return {
      connected: this.isConnected,
      socketConnected: this.socket?.connected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      isInitialized: this.isInitialized,
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
      socketUrl: socketUrl,
      hasToken: !!getCookie('token'),
    };
  }

  public emitDebugEvent(eventName: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(eventName, data);
      console.log(`SocketService: Debug event emitted: ${eventName}`, data);
    } else {
      console.error(`SocketService: Cannot emit debug event - socket not connected`);
    }
  }

  // Force reconnection
  public forceReconnect() {
    console.log('SocketService: Force reconnecting...');
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  // Test different URL formats to find the correct WebSocket endpoint
  public testDifferentEndpoints() {
    console.log('SocketService: Testing different WebSocket endpoints...');

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('SocketService: NEXT_PUBLIC_BACKEND_URL is not defined');
      return;
    }

    // Extract the base domain from the API URL
    let baseUrl: string;
    if (backendUrl.includes('/api/v1')) {
      baseUrl = backendUrl.split('/api/v1')[0];
    } else {
      baseUrl = backendUrl;
    }

    // Convert base URL to WebSocket
    let baseSocketUrl: string;
    if (baseUrl.startsWith('https://')) {
      baseSocketUrl = baseUrl.replace('https://', 'wss://');
    } else if (baseUrl.startsWith('http://')) {
      baseSocketUrl = baseUrl.replace('http://', 'ws://');
    } else {
      baseSocketUrl = `wss://${baseUrl}`;
    }

    const endpoints = [
      // Try base URL (most likely to work based on Postman test)
      baseSocketUrl,
      // Try base URL with /slots namespace
      baseSocketUrl + '/slots',
      // Try base URL with /socket
      baseSocketUrl + '/socket',
      // Try base URL with /ws
      baseSocketUrl + '/ws',
      // Try base URL with /realtime
      baseSocketUrl + '/realtime',
      // Try base URL with /api/v1 (in case it's needed)
      baseSocketUrl + '/api/v1',
      // Try base URL with /slots
      baseSocketUrl + '/slots',
    ];

    endpoints.forEach((endpoint, index) => {
      setTimeout(() => {
        console.log(`SocketService: Testing endpoint ${index + 1}: ${endpoint}`);
        this.testNamespace(endpoint);
      }, index * 2000); // Test each endpoint with 2-second intervals
    });
  }

  // Test different namespaces
  public testNamespace(namespace: string) {
    console.log(`SocketService: Testing namespace: ${namespace}`);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('SocketService: NEXT_PUBLIC_BACKEND_URL is not defined');
      return;
    }

    // Convert HTTP URL to WebSocket URL
    let socketUrl: string;
    if (backendUrl.startsWith('https://')) {
      socketUrl = backendUrl.replace('https://', 'wss://');
    } else if (backendUrl.startsWith('http://')) {
      socketUrl = backendUrl.replace('http://', 'ws://');
    } else {
      socketUrl = `wss://${backendUrl}`;
    }

    // If namespace is provided, append it properly
    if (namespace && namespace !== '') {
      // Remove leading slash if present to avoid double slashes
      const cleanNamespace = namespace.startsWith('/') ? namespace.slice(1) : namespace;
      socketUrl = `${socketUrl}/${cleanNamespace}`;
    }

    console.log(`SocketService: Testing WebSocket URL: ${socketUrl}`);

    const testSocket = io(socketUrl, {
      auth: { token: getCookie('token') || '' },
      transports: ['websocket', 'polling'],
      autoConnect: false,
      timeout: 5000,
    });

    testSocket.on('connect', () => {
      console.log(`SocketService: Successfully connected to namespace: ${namespace}`);
      testSocket.disconnect();
    });

    testSocket.on('connect_error', (error) => {
      console.log(`SocketService: Failed to connect to namespace: ${namespace}`, error.message);
      testSocket.disconnect();
    });

    testSocket.connect();
  }

  // Test basic WebSocket connectivity
  public testBasicConnection() {
    console.log('SocketService: Testing basic WebSocket connectivity...');

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('SocketService: NEXT_PUBLIC_BACKEND_URL is not defined');
      return;
    }

    // Extract the base domain from the API URL
    let baseUrl: string;
    if (backendUrl.includes('/api/v1')) {
      baseUrl = backendUrl.split('/api/v1')[0];
    } else {
      baseUrl = backendUrl;
    }

    // Convert to WebSocket URL
    let socketUrl: string;
    if (baseUrl.startsWith('https://')) {
      socketUrl = baseUrl.replace('https://', 'wss://');
    } else if (baseUrl.startsWith('http://')) {
      socketUrl = baseUrl.replace('http://', 'ws://');
    } else {
      socketUrl = `wss://${baseUrl}`;
    }

    console.log(`SocketService: Testing basic connection to: ${socketUrl}`);
    console.log(`SocketService: Base URL: ${baseUrl}`);

    const testSocket = io(socketUrl, {
      auth: { token: getCookie('token') || '' },
      transports: ['websocket', 'polling'],
      autoConnect: false,
      timeout: 10000,
    });

    testSocket.on('connect', () => {
      console.log('SocketService: ✅ Basic WebSocket connection successful!');
      console.log('SocketService: Socket ID:', testSocket.id);
      testSocket.disconnect();
    });

    testSocket.on('connect_error', (error) => {
      console.log('SocketService: ❌ Basic WebSocket connection failed:', error.message);
      console.log(
        'SocketService: This suggests the backend may not have WebSocket support enabled',
      );
      testSocket.disconnect();
    });

    testSocket.connect();
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
