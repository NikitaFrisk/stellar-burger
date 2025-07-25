import { Middleware, Action } from '@reduxjs/toolkit';
import { RootState } from '../store';

// WebSocket action types
export const WS_CONNECTION_START = 'WS_CONNECTION_START';
export const WS_CONNECTION_SUCCESS = 'WS_CONNECTION_SUCCESS';
export const WS_CONNECTION_ERROR = 'WS_CONNECTION_ERROR';
export const WS_CONNECTION_CLOSED = 'WS_CONNECTION_CLOSED';
export const WS_GET_MESSAGE = 'WS_GET_MESSAGE';
export const WS_SEND_MESSAGE = 'WS_SEND_MESSAGE';
export const WS_CONNECTION_CLOSE = 'WS_CONNECTION_CLOSE';

// WebSocket action interfaces
export interface WSConnectionStartAction {
  type: typeof WS_CONNECTION_START;
  payload: {
    url: string;
    token?: string;
  };
}

export interface WSConnectionSuccessAction {
  type: typeof WS_CONNECTION_SUCCESS;
}

export interface WSConnectionErrorAction {
  type: typeof WS_CONNECTION_ERROR;
  payload: string;
}

export interface WSConnectionClosedAction {
  type: typeof WS_CONNECTION_CLOSED;
}

export interface WSGetMessageAction {
  type: typeof WS_GET_MESSAGE;
  payload: any;
}

export interface WSSendMessageAction {
  type: typeof WS_SEND_MESSAGE;
  payload: any;
}

export interface WSConnectionCloseAction {
  type: typeof WS_CONNECTION_CLOSE;
}

export type WSAction = 
  | WSConnectionStartAction
  | WSConnectionSuccessAction
  | WSConnectionErrorAction
  | WSConnectionClosedAction
  | WSGetMessageAction
  | WSSendMessageAction
  | WSConnectionCloseAction;

// Action creators
export const wsConnectionStart = (url: string, token?: string): WSConnectionStartAction => ({
  type: WS_CONNECTION_START,
  payload: { url, token }
});

export const wsConnectionSuccess = (): WSConnectionSuccessAction => ({
  type: WS_CONNECTION_SUCCESS
});

export const wsConnectionError = (error: string): WSConnectionErrorAction => ({
  type: WS_CONNECTION_ERROR,
  payload: error
});

export const wsConnectionClosed = (): WSConnectionClosedAction => ({
  type: WS_CONNECTION_CLOSED
});

export const wsGetMessage = (message: any): WSGetMessageAction => ({
  type: WS_GET_MESSAGE,
  payload: message
});

export const wsSendMessage = (message: any): WSSendMessageAction => ({
  type: WS_SEND_MESSAGE,
  payload: message
});

export const wsConnectionClose = (): WSConnectionCloseAction => ({
  type: WS_CONNECTION_CLOSE
});

// WebSocket middleware configuration
export interface WebSocketMiddlewareConfig {
  connectionStart: string;
  connectionSuccess: string;
  connectionError: string;
  connectionClosed: string;
  getMessage: string;
  sendMessage: string;
  connectionClose: string;
}

// WebSocket middleware factory
export const createWebSocketMiddleware = (config: WebSocketMiddlewareConfig): Middleware => {
  let socket: WebSocket | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;
  let url: string = '';
  let token: string | undefined = undefined;

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  return (store) => (next) => (action: any) => {
    const { dispatch } = store;

    const reconnect = () => {
      clearReconnectTimer();
      reconnectTimer = setTimeout(() => {
        console.log('[WebSocket] Attempting to reconnect...');
        dispatch({ type: config.connectionStart, payload: { url, token } });
      }, 3000);
    };

    // Handle connection start
    if (action.type === config.connectionStart) {
      clearReconnectTimer();
      
      if (socket) {
        socket.close();
      }

      url = action.payload?.url || '';
      token = action.payload?.token;

      // Add token to URL if provided
      const wsUrl = token ? `${url}?token=${token}` : url;
      
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('[WebSocket] Connection opened');
        dispatch({ type: config.connectionSuccess });
      };

      socket.onerror = (event) => {
        console.error('[WebSocket] Connection error:', event);
        dispatch({ type: config.connectionError, payload: 'WebSocket connection error' });
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', data);
          dispatch({ type: config.getMessage, payload: data });
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
          dispatch({ type: config.connectionError, payload: 'Error parsing WebSocket message' });
        }
      };

      socket.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', event.code, event.reason);
        dispatch({ type: config.connectionClosed });
        
        // Attempt to reconnect if the connection was closed unexpectedly
        if (event.code !== 1000) {
          reconnect();
        }
      };
    }

    // Handle connection close
    if (action.type === config.connectionClose) {
      clearReconnectTimer();
      if (socket) {
        socket.close(1000, 'Manual close');
        socket = null;
      }
    }

    // Handle send message
    if (action.type === config.sendMessage && socket && socket.readyState === WebSocket.OPEN) {
      try {
        const message = JSON.stringify(action.payload);
        socket.send(message);
        console.log('[WebSocket] Message sent:', message);
      } catch (error) {
        console.error('[WebSocket] Error sending message:', error);
        dispatch({ type: config.connectionError, payload: 'Error sending WebSocket message' });
      }
    }

    return next(action);
  };
};

// Default middleware instance for feed
export const feedWebSocketMiddleware = createWebSocketMiddleware({
  connectionStart: 'feed/connectToFeed',
  connectionSuccess: 'feed/connectionSuccess',
  connectionError: 'feed/connectionError',
  connectionClosed: 'feed/connectionClosed',
  getMessage: 'feed/messageReceived',
  sendMessage: 'feed/sendMessage',
  connectionClose: 'feed/disconnectFromFeed'
});

// Default middleware instance for order history
export const orderHistoryWebSocketMiddleware = createWebSocketMiddleware({
  connectionStart: 'orderHistory/connectToOrderHistory',
  connectionSuccess: 'orderHistory/connectionSuccess',
  connectionError: 'orderHistory/connectionError',
  connectionClosed: 'orderHistory/connectionClosed',
  getMessage: 'orderHistory/messageReceived',
  sendMessage: 'orderHistory/sendMessage',
  connectionClose: 'orderHistory/disconnectFromOrderHistory'
});
