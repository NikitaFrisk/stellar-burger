import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { IFeedOrder, IFeedMessage } from '../../utils/types';
import { RootState } from '../store';

// Состояние истории заказов пользователя
export interface OrderHistoryState {
  orders: IFeedOrder[];
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connectionUrl: string | null;
}

// Начальное состояние
export const initialState: OrderHistoryState = {
  orders: [],
  isConnecting: false,
  isConnected: false,
  error: null,
  connectionUrl: null,
};

// Слайс для истории заказов
const orderHistorySlice = createSlice({
  name: 'orderHistory',
  initialState,
  reducers: {
    // Подключение к WebSocket
    connectToOrderHistory: (state, action: PayloadAction<string>) => {
      state.isConnecting = true;
      state.isConnected = false;
      state.error = null;
      state.connectionUrl = action.payload;
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
      const { success, orders } = action.payload;
      
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

        console.log(`[OrderHistory] Received ${orders.length} orders, ${validOrders.length} valid`);
        
        // Сортируем заказы по дате создания (новые сверху)
        state.orders = validOrders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        state.error = null;
      } else {
        state.error = 'Ошибка получения истории заказов';
      }
    },

    // Отправка сообщения (пока не используется)
    sendMessage: (state, action: PayloadAction<any>) => {
      // Логика отправки сообщения, если понадобится
    },

    // Отключение от WebSocket
    disconnectFromOrderHistory: (state) => {
      state.isConnecting = false;
      state.isConnected = false;
      state.connectionUrl = null;
    },

    // Очистка истории
    clearOrderHistory: (state) => {
      state.orders = [];
      state.error = null;
    },
  },
});

// Экспорт действий
export const {
  connectToOrderHistory,
  connectionSuccess,
  connectionError,
  connectionClosed,
  messageReceived,
  sendMessage,
  disconnectFromOrderHistory,
  clearOrderHistory,
} = orderHistorySlice.actions;

// Селекторы
export const selectOrderHistoryOrders = (state: RootState) => state.orderHistory.orders;
export const selectOrderHistoryLoading = (state: RootState) => state.orderHistory.isConnecting;
export const selectOrderHistoryConnected = (state: RootState) => state.orderHistory.isConnected;
export const selectOrderHistoryError = (state: RootState) => state.orderHistory.error;

// Селектор для получения заказа по номеру
export const selectOrderHistoryOrderByNumber = (state: RootState, orderNumber: number) => {
  return state.orderHistory.orders.find((order: IFeedOrder) => order.number === orderNumber);
};

// Селектор для заказов по статусу (мемоизированный)
export const selectOrderHistoryOrdersByStatus = createSelector(
  [selectOrderHistoryOrders],
  (orders) => ({
    done: orders.filter((order: IFeedOrder) => order.status === 'done'),
    pending: orders.filter((order: IFeedOrder) => order.status === 'pending'),
    created: orders.filter((order: IFeedOrder) => order.status === 'created'),
  })
);

// Экспорт reducer
export default orderHistorySlice.reducer;
