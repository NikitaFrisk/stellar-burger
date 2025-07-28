import { Middleware, Action } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Интерфейс для конфигурации WebSocket actions
export interface WebSocketActionTypes {
  connectionStart: string;
  connectionSuccess: string;
  connectionError: string;
  connectionClosed: string;
  getMessage: string;
  sendMessage: string;
  connectionClose: string;
}

// Универсальный WebSocket middleware
export const createWebSocketMiddleware = (actionTypes: WebSocketActionTypes): Middleware => {
  let socket: WebSocket | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;
  let isClosingConnection = false;
  let connectionAttempts = 0;
  const maxConnectionAttempts = 5;

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  return (store) => (next) => (action: any) => {
    const { dispatch } = store;

    const reconnect = (url: string) => {
      clearReconnectTimer();
      
      if (connectionAttempts >= maxConnectionAttempts) {
        console.error('[WebSocket] Max reconnection attempts reached');
        dispatch({ type: actionTypes.connectionError, payload: 'Max reconnection attempts reached' });
        return;
      }

      const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
      console.log(`[WebSocket] Attempting to reconnect in ${delay}ms (attempt ${connectionAttempts + 1}/${maxConnectionAttempts})`);
      
      reconnectTimer = setTimeout(() => {
        connectionAttempts++;
        dispatch({ type: actionTypes.connectionStart, payload: url });
      }, delay);
    };

    const createConnection = (url: string) => {
      if (isClosingConnection) {
        setTimeout(() => createConnection(url), 200);
        return;
      }

      if (socket && socket.readyState === WebSocket.CONNECTING) {
        console.log('[WebSocket] Connection already in progress, skipping');
        return;
      }

      try {
        console.log('[WebSocket] Creating new connection to:', url);
        socket = new WebSocket(url);

        socket.onopen = () => {
          console.log('[WebSocket] Connection opened successfully');
          connectionAttempts = 0;
          dispatch({ type: actionTypes.connectionSuccess });
        };

        socket.onerror = (event) => {
          console.error('[WebSocket] Connection error:', event);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[WebSocket] Message received:', data);
            
            if (!data.success && data.message === 'Invalid or missing token') {
              console.error('[WebSocket] Invalid or missing token error');
              dispatch({ type: actionTypes.connectionError, payload: 'Invalid or missing token' });
              if (socket) {
                isClosingConnection = true;
                socket.close(1000, 'Invalid token');
                socket = null;
              }
              return;
            }
            
            dispatch({ type: actionTypes.getMessage, payload: data });
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
            dispatch({ type: actionTypes.connectionError, payload: 'Error parsing WebSocket message' });
          }
        };

        socket.onclose = (event) => {
          console.log('[WebSocket] Connection closed:', event.code, event.reason);
          isClosingConnection = false;
          dispatch({ type: actionTypes.connectionClosed });
          
          if (event.code !== 1000 && connectionAttempts < maxConnectionAttempts) {
            reconnect(url);
          } else if (event.code !== 1000) {
            dispatch({ type: actionTypes.connectionError, payload: 'WebSocket connection failed' });
          }
        };
      } catch (error) {
        console.error('[WebSocket] Error creating connection:', error);
        dispatch({ type: actionTypes.connectionError, payload: 'Failed to create WebSocket connection' });
      }
    };

    // Handle connection start
    if (action.type === actionTypes.connectionStart) {
      clearReconnectTimer();
      
      const url = action.payload;
      
      if (!url || typeof url !== 'string') {
        console.error('[WebSocket] No valid URL provided for connection');
        dispatch({ type: actionTypes.connectionError, payload: 'No valid URL provided' });
        return next(action);
      }
      
      if (socket && socket.readyState === WebSocket.OPEN && socket.url === url) {
        console.log('[WebSocket] Connection already open to the same URL, skipping');
        return next(action);
      }
      
      if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
        console.log('[WebSocket] Closing existing connection before creating new one');
        isClosingConnection = true;
        socket.close(1000, 'New connection requested');
        socket = null;
        
        setTimeout(() => {
          isClosingConnection = false;
          createConnection(url);
        }, 300);
      } else {
        connectionAttempts = 0;
        createConnection(url);
      }
    }

    // Handle connection close
    if (action.type === actionTypes.connectionClose) {
      clearReconnectTimer();
      connectionAttempts = 0;
      if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
        isClosingConnection = true;
        socket.close(1000, 'Manual close');
        socket = null;
      }
    }

    // Handle send message
    if (action.type === actionTypes.sendMessage && socket && socket.readyState === WebSocket.OPEN) {
      try {
        const message = JSON.stringify(action.payload);
        socket.send(message);
        console.log('[WebSocket] Message sent:', message);
      } catch (error) {
        console.error('[WebSocket] Error sending message:', error);
        dispatch({ type: actionTypes.connectionError, payload: 'Error sending WebSocket message' });
      }
    }

    return next(action);
  };
};

// Экземпляры middleware для разных типов WebSocket соединений
export const feedWebSocketMiddleware = createWebSocketMiddleware({
  connectionStart: 'feed/connectToFeed',
  connectionSuccess: 'feed/connectionSuccess',
  connectionError: 'feed/connectionError',
  connectionClosed: 'feed/connectionClosed',
  getMessage: 'feed/messageReceived',
  sendMessage: 'feed/sendMessage',
  connectionClose: 'feed/disconnectFromFeed'
});

export const orderHistoryWebSocketMiddleware = createWebSocketMiddleware({
  connectionStart: 'orderHistory/connectToOrderHistory',
  connectionSuccess: 'orderHistory/connectionSuccess',
  connectionError: 'orderHistory/connectionError',
  connectionClosed: 'orderHistory/connectionClosed',
  getMessage: 'orderHistory/messageReceived',
  sendMessage: 'orderHistory/sendMessage',
  connectionClose: 'orderHistory/disconnectFromOrderHistory'
});
