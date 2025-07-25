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
  let isClosingConnection = false;
  let connectionAttempts = 0;
  let maxConnectionAttempts = 5;

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
      
      if (connectionAttempts >= maxConnectionAttempts) {
        console.error('[WebSocket] Max reconnection attempts reached');
        dispatch({ type: config.connectionError, payload: 'Max reconnection attempts reached' });
        return;
      }

      const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000); // Exponential backoff, max 30s
      console.log(`[WebSocket] Attempting to reconnect in ${delay}ms (attempt ${connectionAttempts + 1}/${maxConnectionAttempts})`);
      
      reconnectTimer = setTimeout(() => {
        connectionAttempts++;
        dispatch({ type: config.connectionStart, payload: { url, token } });
      }, delay);
    };

    const createConnection = (wsUrl: string) => {
      if (isClosingConnection) {
        // Если идет процесс закрытия, отложим создание нового соединения
        setTimeout(() => createConnection(wsUrl), 200);
        return;
      }

      // Проверяем, не создаем ли мы уже соединение
      if (socket && socket.readyState === WebSocket.CONNECTING) {
        console.log('[WebSocket] Connection already in progress, skipping');
        return;
      }

      try {
        console.log('[WebSocket] Creating new connection to:', wsUrl);
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          console.log('[WebSocket] Connection opened successfully');
          connectionAttempts = 0; // Сбрасываем счетчик при успешном подключении
          dispatch({ type: config.connectionSuccess });
        };

        socket.onerror = (event) => {
          console.error('[WebSocket] Connection error:', event);
          // Не диспатчим ошибку сразу, дождемся onclose
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[WebSocket] Message received:', data);
            
            // Проверяем на ошибку "Invalid or missing token"
            if (!data.success && data.message === 'Invalid or missing token') {
              console.error('[WebSocket] Invalid or missing token error');
              dispatch({ type: config.connectionError, payload: 'Invalid or missing token' });
              // Закрываем соединение при ошибке токена
              if (socket) {
                isClosingConnection = true;
                socket.close(1000, 'Invalid token');
                socket = null;
              }
              return;
            }
            
            dispatch({ type: config.getMessage, payload: data });
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
            dispatch({ type: config.connectionError, payload: 'Error parsing WebSocket message' });
          }
        };

        socket.onclose = (event) => {
          console.log('[WebSocket] Connection closed:', event.code, event.reason);
          isClosingConnection = false;
          dispatch({ type: config.connectionClosed });
          
          // Реконнектимся только если закрытие было неожиданным и мы не достигли лимита попыток
          if (event.code !== 1000 && connectionAttempts < maxConnectionAttempts) {
            reconnect();
          } else if (event.code !== 1000) {
            dispatch({ type: config.connectionError, payload: 'WebSocket connection failed' });
          }
        };
      } catch (error) {
        console.error('[WebSocket] Error creating connection:', error);
        dispatch({ type: config.connectionError, payload: 'Failed to create WebSocket connection' });
      }
    };

    // Handle connection start
    if (action.type === config.connectionStart) {
      clearReconnectTimer();
      
      // Если уже есть открытое соединение к тому же URL, не создаем новое
      const newUrl = action.payload?.url || '';
      const newToken = action.payload?.token;
      const newWsUrl = newToken ? `${newUrl}?token=${newToken}` : newUrl;
      
      if (socket && socket.readyState === WebSocket.OPEN && url === newUrl && token === newToken) {
        console.log('[WebSocket] Connection already open to the same URL, skipping');
        return next(action);
      }
      
      // Закрываем существующее соединение если есть
      if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
        console.log('[WebSocket] Closing existing connection before creating new one');
        isClosingConnection = true;
        socket.close(1000, 'New connection requested');
        socket = null;
        
        // Увеличиваем задержку для медленных серверов
        setTimeout(() => {
          url = newUrl;
          token = newToken;
          isClosingConnection = false;
          createConnection(newWsUrl);
        }, 300); // Увеличили с 50ms до 300ms
      } else {
        url = newUrl;
        token = newToken;
        connectionAttempts = 0; // Сбрасываем счетчик при новом подключении
        createConnection(newWsUrl);
      }
    }

    // Handle connection close
    if (action.type === config.connectionClose) {
      clearReconnectTimer();
      connectionAttempts = 0; // Сбрасываем счетчик при ручном закрытии
      if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
        isClosingConnection = true;
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
