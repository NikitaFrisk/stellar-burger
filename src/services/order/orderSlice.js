import { createSlice } from '@reduxjs/toolkit';
import { clearConstructor } from '../constructor/constructorSlice';
import { BASE_URL, ENDPOINTS, checkResponse } from '../../utils/api-constants';
import { refreshToken } from '../auth/authSlice';

const initialState = {
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
		orderSuccess: (state, action) => {
			state.order = action.payload;
			state.loading = false;
		},
		orderError: (state, action) => {
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

export const selectOrder = (state) => state.order.order;
export const selectOrderLoading = (state) => state.order.loading;
export const selectOrderError = (state) => state.order.error;

export const createOrder = (ingredients) => {
	return async (dispatch) => {
		dispatch(orderRequest());
		try {
			let accessToken = localStorage.getItem('accessToken');
			
			const response = await fetch(`${BASE_URL}${ENDPOINTS.ORDERS}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': accessToken || '',
				},
				body: JSON.stringify({ ingredients }),
			});

			if (response.status === 401) {
				// Токен истек, обновляем
				const refreshResult = await dispatch(refreshToken());
				if (refreshResult.type === 'auth/refreshToken/fulfilled') {
					accessToken = refreshResult.payload.accessToken;
					
					const retryResponse = await fetch(`${BASE_URL}${ENDPOINTS.ORDERS}`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': accessToken || '',
						},
						body: JSON.stringify({ ingredients }),
					});
					
					const data = await checkResponse(retryResponse);
					dispatch(orderSuccess(data.order));
					dispatch(clearConstructor());
				} else {
					throw new Error('Token refresh failed');
				}
			} else {
				const data = await checkResponse(response);
				dispatch(orderSuccess(data.order));
				dispatch(clearConstructor());
			}
		} catch (error) {
			dispatch(orderError(error.message));
		}
	};
};
