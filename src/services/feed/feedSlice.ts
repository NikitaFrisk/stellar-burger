import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { IFeedOrder, IFeedMessage, TOrderStatus } from '../../utils/types';
import { RootState } from '../store';

// Состояние ленты заказов
interface FeedState {
  orders: IFeedOrder[];
  total: number;
  totalToday: number;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connectionUrl: string | null;
}

// Начальное состояние
const initialState: FeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isConnecting: false,
  isConnected: false,
  error: null,
  connectionUrl: null,
};

// Слайс для ленты заказов
const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    // Подключение к WebSocket
    connectToFeed: (state, action: PayloadAction<{ url: string }>) => {
      state.isConnecting = true;
      state.isConnected = false;
      state.error = null;
      state.connectionUrl = action.payload.url;
    },

    // Успешное подключение
    connectionSuccess: (state) => {
      state.isConnecting = false;
      state.isConnected = true;
      state.error = null;
    },

    // Ошибка подключения
    connectionError: (state, action: PayloadAction<string>) => {
      state.isConnecting = false;
      state.isConnected = false;
      state.error = action.payload;
    },

    // Соединение закрыто
    connectionClosed: (state) => {
      state.isConnecting = false;
      state.isConnected = false;
    },

    // Получение сообщения
    messageReceived: (state, action: PayloadAction<IFeedMessage>) => {
      const { success, orders, total, totalToday } = action.payload;
      
      if (success && orders && Array.isArray(orders)) {
        // Валидируем и фильтруем заказы
        const validOrders = orders.filter((order: IFeedOrder) => {
          // Проверяем обязательные поля заказа
          return (
            order &&
            typeof order._id === 'string' &&
            typeof order.number === 'number' &&
            typeof order.name === 'string' &&
            typeof order.status === 'string' &&
            ['done', 'pending', 'created'].includes(order.status) &&
            Array.isArray(order.ingredients) &&
            typeof order.createdAt === 'string' &&
            typeof order.updatedAt === 'string' &&
            order.ingredients.every(id => typeof id === 'string')
          );
        });

        console.log(`[Feed] Received ${orders.length} orders, ${validOrders.length} valid`);
        
        state.orders = validOrders;
        state.total = typeof total === 'number' ? total : 0;
        state.totalToday = typeof totalToday === 'number' ? totalToday : 0;
        state.error = null;
      } else {
        state.error = 'Ошибка получения данных';
      }
    },

    // Отправка сообщения (пока не используется для feed)
    sendMessage: (state, action: PayloadAction<any>) => {
      // Логика отправки сообщения, если понадобится
    },

    // Отключение от WebSocket
    disconnectFromFeed: (state) => {
      state.isConnecting = false;
      state.isConnected = false;
      state.connectionUrl = null;
    },

    // Очистка ленты
    clearFeed: (state) => {
      state.orders = [];
      state.total = 0;
      state.totalToday = 0;
      state.error = null;
    },
  },
});

// Экспорт действий
export const {
  connectToFeed,
  connectionSuccess,
  connectionError,
  connectionClosed,
  messageReceived,
  sendMessage,
  disconnectFromFeed,
  clearFeed,
} = feedSlice.actions;

// Селекторы
export const selectFeedOrders = (state: RootState) => state.feed.orders;
export const selectFeedTotal = (state: RootState) => state.feed.total;
export const selectFeedTotalToday = (state: RootState) => state.feed.totalToday;
export const selectFeedLoading = (state: RootState) => state.feed.isConnecting;
export const selectFeedConnected = (state: RootState) => state.feed.isConnected;
export const selectFeedError = (state: RootState) => state.feed.error;

// Селектор для заказов по статусу (мемоизированный)
export const selectFeedOrdersByStatus = createSelector(
  [selectFeedOrders],
  (orders) => ({
    done: orders.filter((order: IFeedOrder) => order.status === 'done'),
    pending: orders.filter((order: IFeedOrder) => order.status === 'pending'),
    created: orders.filter((order: IFeedOrder) => order.status === 'created'),
  })
);

// Селектор для получения заказа по номеру
export const selectFeedOrderByNumber = (state: RootState, orderNumber: number) => {
  return state.feed.orders.find((order: IFeedOrder) => order.number === orderNumber);
};

// Экспорт reducer
export default feedSlice.reducer;
