import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { IFeedOrder } from '../../utils/types';
import { ENDPOINTS, request } from '../../utils/api-constants';
import { RootState } from '../store';

// Состояние для получения деталей заказа
interface OrderDetailsState {
  order: IFeedOrder | null;
  loading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: OrderDetailsState = {
  order: null,
  loading: false,
  error: null,
};

// Async thunk для получения заказа по номеру
export const fetchOrderByNumber = createAsyncThunk<
  IFeedOrder,
  number,
  { state: RootState; rejectValue: string }
>(
  'orderDetails/fetchOrderByNumber',
  async (orderNumber, { rejectWithValue }) => {
    try {
      const response = await request<{ orders: IFeedOrder[] }>(`${ENDPOINTS.ORDERS}/${orderNumber}`);
      
      if (response.orders && response.orders.length > 0) {
        return response.orders[0];
      } else {
        return rejectWithValue('Заказ не найден');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка загрузки заказа');
    }
  }
);

// Слайс для деталей заказа
const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState,
  reducers: {
    clearOrderDetails: (state) => {
      state.order = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка загрузки заказа';
      });
  },
});

// Экспорт действий
export const { clearOrderDetails } = orderDetailsSlice.actions;

// Селекторы
export const selectOrderDetailsOrder = (state: RootState) => state.orderDetails.order;
export const selectOrderDetailsLoading = (state: RootState) => state.orderDetails.loading;
export const selectOrderDetailsError = (state: RootState) => state.orderDetails.error;

// Экспорт reducer
export default orderDetailsSlice.reducer;
