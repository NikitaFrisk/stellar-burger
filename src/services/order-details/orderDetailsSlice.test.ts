import orderDetailsReducer, {
	fetchOrderByNumber,
	clearOrderDetails,
	selectOrderDetailsOrder,
	selectOrderDetailsLoading,
	selectOrderDetailsError
} from './orderDetailsSlice';
import { IFeedOrder } from '../../utils/types';

// Мокаем API
jest.mock('../../utils/api-constants', () => ({
	request: jest.fn(),
	ENDPOINTS: {
		ORDERS: '/api/orders'
	}
}));

// Мокаем данные для тестирования
const mockOrder: IFeedOrder = {
	_id: '64e5f9e5bb0c9e3d65b74e56',
	ingredients: ['643d69a5c3f7b9001cfa093c', '643d69a5c3f7b9001cfa0941'],
	status: 'done',
	number: 12345,
	createdAt: '2023-08-23T10:30:00.000Z',
	updatedAt: '2023-08-23T10:30:30.000Z',
	name: 'Краторный бургер'
};

const initialState = {
	order: null,
	loading: false,
	error: null,
};

describe('orderDetailsSlice', () => {
	describe('initial state', () => {
		test('should return the initial state', () => {
			const result = orderDetailsReducer(undefined, { type: '@@INIT' });
			expect(result).toEqual(initialState);
		});
	});

	describe('reducers', () => {
		test('should handle clearOrderDetails', () => {
			const stateWithOrder = {
				order: mockOrder,
				loading: false,
				error: 'Some error'
			};

			const action = clearOrderDetails();
			const state = orderDetailsReducer(stateWithOrder, action);

			expect(state).toEqual({
				...stateWithOrder,
				order: null,
				error: null
			});
		});
	});

	describe('async thunks', () => {
		describe('fetchOrderByNumber', () => {
			test('should handle fetchOrderByNumber.pending', () => {
				const action = fetchOrderByNumber.pending('', 12345);
				const state = orderDetailsReducer(initialState, action);

				expect(state).toEqual({
					...initialState,
					loading: true,
					error: null
				});
			});

			test('should handle fetchOrderByNumber.fulfilled', () => {
				const loadingState = {
					...initialState,
					loading: true
				};

				const action = fetchOrderByNumber.fulfilled(mockOrder, '', 12345);
				const state = orderDetailsReducer(loadingState, action);

				expect(state).toEqual({
					order: mockOrder,
					loading: false,
					error: null
				});
			});

			test('should handle fetchOrderByNumber.rejected', () => {
				const loadingState = {
					...initialState,
					loading: true
				};

				const action = fetchOrderByNumber.rejected(null, '', 12345, 'Order not found');
				const state = orderDetailsReducer(loadingState, action);

				expect(state).toEqual({
					order: null,
					loading: false,
					error: 'Order not found'
				});
			});

			test('should handle fetchOrderByNumber.rejected with no payload', () => {
				const loadingState = {
					...initialState,
					loading: true
				};

				const action = fetchOrderByNumber.rejected(null, '', 12345);
				const state = orderDetailsReducer(loadingState, action);

				expect(state).toEqual({
					order: null,
					loading: false,
					error: 'Ошибка загрузки заказа'
				});
			});
		});
	});

	describe('selectors', () => {
		const mockState = {
			orderDetails: {
				order: mockOrder,
				loading: false,
				error: null
			}
		} as any;

		test('selectOrderDetailsOrder should return order', () => {
			const result = selectOrderDetailsOrder(mockState);
			expect(result).toEqual(mockOrder);
		});

		test('selectOrderDetailsOrder should return null when no order', () => {
			const emptyState = {
				orderDetails: {
					order: null,
					loading: false,
					error: null
				}
			} as any;
			const result = selectOrderDetailsOrder(emptyState);
			expect(result).toBeNull();
		});

		test('selectOrderDetailsLoading should return loading status', () => {
			const result = selectOrderDetailsLoading(mockState);
			expect(result).toBe(false);
		});

		test('selectOrderDetailsLoading should return true when loading', () => {
			const loadingState = {
				orderDetails: {
					...mockState.orderDetails,
					loading: true
				}
			} as any;
			const result = selectOrderDetailsLoading(loadingState);
			expect(result).toBe(true);
		});

		test('selectOrderDetailsError should return error message', () => {
			const result = selectOrderDetailsError(mockState);
			expect(result).toBeNull();
		});

		test('selectOrderDetailsError should return error when present', () => {
			const errorState = {
				orderDetails: {
					...mockState.orderDetails,
					error: 'Test error'
				}
			} as any;
			const result = selectOrderDetailsError(errorState);
			expect(result).toBe('Test error');
		});
	});
});
