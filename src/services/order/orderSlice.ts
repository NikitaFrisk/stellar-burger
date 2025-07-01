import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearConstructor } from '../constructor/constructorSlice';
import { ENDPOINTS, request } from '../../utils/api-constants';
import { refreshToken } from '../auth/authSlice';
import { IOrder } from '@utils/types';
import { AppDispatch, RootState } from '../store';

interface IOrderState {
	order: IOrder | null;
	loading: boolean;
	error: string | null;
}

const initialState: IOrderState = {
	order: null,
	loading: false,
	error: null,
};

export const orderSlice = createSlice({
	name: 'order',
	initialState,
	reducers: {
		orderRequest: (state) => {
			state.loading = true;
			state.error = null;
		},
		orderSuccess: (state, action: PayloadAction<IOrder>) => {
			state.order = action.payload;
			state.loading = false;
		},
		orderError: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},
		clearOrder: (state) => {
			state.order = null;
		},
	},
});

export const { orderRequest, orderSuccess, orderError, clearOrder } =
	orderSlice.actions;
export const orderReducer = orderSlice.reducer;

export const selectOrder = (state: RootState): IOrder | null => state.order.order;
export const selectOrderLoading = (state: RootState): boolean => state.order.loading;
export const selectOrderError = (state: RootState): string | null => state.order.error;

export const createOrder = (ingredients: string[]) => {
	return async (dispatch: AppDispatch) => {
		dispatch(orderRequest());
		try {
			let accessToken = localStorage.getItem('accessToken');

			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: accessToken || '',
				},
				body: JSON.stringify({ ingredients }),
			};

			try {
				const data = await request(ENDPOINTS.ORDERS, options);
				dispatch(orderSuccess(data.order));
				dispatch(clearConstructor());
			} catch (error: any) {
				// Если ошибка 401, пробуем обновить токен
				if (error.message.includes('401')) {
					const refreshResult = await dispatch(refreshToken());
					if (refreshResult.type === 'auth/refreshToken/fulfilled') {
						accessToken = (refreshResult.payload as any).accessToken;

						const retryOptions = {
							...options,
							headers: {
								...options.headers,
								Authorization: accessToken || '',
							},
						};

						const data = await request(ENDPOINTS.ORDERS, retryOptions);
						dispatch(orderSuccess(data.order));
						dispatch(clearConstructor());
					} else {
						throw new Error('Token refresh failed');
					}
				} else {
					throw error;
				}
			}
		} catch (error: any) {
			dispatch(orderError(error.message));
		}
	};
}; 