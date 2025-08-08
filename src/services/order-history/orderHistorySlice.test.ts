import orderHistoryReducer, {
	initialState,
	OrderHistoryState,
	connectToOrderHistory,
	connectionSuccess,
	connectionError,
	connectionClosed,
	messageReceived,
	sendMessage,
	disconnectFromOrderHistory,
	clearOrderHistory,
	selectOrderHistoryOrders,
	selectOrderHistoryLoading,
	selectOrderHistoryConnected,
	selectOrderHistoryError,
	selectOrderHistoryOrderByNumber,
	selectOrderHistoryOrdersByStatus
} from './orderHistorySlice';
import { IFeedOrder } from '../../utils/types';

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

const mockOrder2: IFeedOrder = {
	_id: '64e5f9e5bb0c9e3d65b74e57',
	ingredients: ['643d69a5c3f7b9001cfa093d'],
	status: 'pending',
	number: 12346,
	createdAt: '2023-08-23T11:00:00.000Z',
	updatedAt: '2023-08-23T11:00:30.000Z',
	name: 'Пендинг бургер'
};

const invalidOrder = {
	_id: '64e5f9e5bb0c9e3d65b74e58',
	status: 'done' as const,
	number: 123,
	name: '',
	ingredients: [],
	createdAt: '',
	updatedAt: ''
};

describe('orderHistorySlice', () => {
	describe('initial state', () => {
		test('should return the initial state', () => {
			const result = orderHistoryReducer(undefined, { type: '@@INIT' });
			expect(result).toEqual(initialState);
		});
	});

	describe('reducers', () => {
		test('should handle connectToOrderHistory', () => {
			const action = connectToOrderHistory('ws://localhost:3001');
			const state = orderHistoryReducer(initialState, action);

			expect(state).toEqual({
				...initialState,
				isConnecting: true,
				isConnected: false,
				error: null,
				connectionUrl: 'ws://localhost:3001'
			});
		});

		test('should handle connectionSuccess', () => {
			const connectingState = {
				...initialState,
				isConnecting: true,
				connectionUrl: 'ws://localhost:3001'
			};

			const action = connectionSuccess();
			const state = orderHistoryReducer(connectingState, action);

			expect(state).toEqual({
				...connectingState,
				isConnecting: false,
				isConnected: true,
				error: null
			});
		});

		test('should handle connectionError', () => {
			const connectingState = {
				...initialState,
				isConnecting: true,
				connectionUrl: 'ws://localhost:3001'
			};

			const action = connectionError('Connection failed');
			const state = orderHistoryReducer(connectingState, action);

			expect(state).toEqual({
				...connectingState,
				isConnecting: false,
				isConnected: false,
				error: 'Connection failed'
			});
		});

		test('should handle connectionClosed', () => {
			const connectedState = {
				...initialState,
				isConnected: true,
				connectionUrl: 'ws://localhost:3001'
			};

			const action = connectionClosed();
			const state = orderHistoryReducer(connectedState, action);

			expect(state).toEqual({
				...connectedState,
				isConnecting: false,
				isConnected: false,
				connectionUrl: 'ws://localhost:3001'
			});
		});

		test('should handle messageReceived with valid orders', () => {
			const connectedState = {
				...initialState,
				isConnected: true
			};

			const action = messageReceived({
				success: true,
				orders: [mockOrder, mockOrder2],
				total: 2,
				totalToday: 1
			});

			const state = orderHistoryReducer(connectedState, action);

			expect(state.orders).toHaveLength(2);
			expect(state.orders[0]).toEqual(mockOrder2); // Newer order first
			expect(state.orders[1]).toEqual(mockOrder);
			expect(state.error).toBeNull();
		});

		test('should handle messageReceived with valid orders', () => {
			const connectedState = {
				...initialState,
				isConnected: true
			};

			const action = messageReceived({
				success: true,
				orders: [mockOrder, invalidOrder],
				total: 2,
				totalToday: 1
			});

			const state = orderHistoryReducer(connectedState, action);

			expect(state.orders).toHaveLength(2);
			expect(state.orders[0]).toEqual(mockOrder);
			expect(state.orders[1]).toEqual(invalidOrder);
			expect(state.error).toBeNull();
		});

		test('should handle messageReceived with error', () => {
			const connectedState = {
				...initialState,
				isConnected: true
			};

			const action = messageReceived({
				success: false,
				orders: [],
				total: 0,
				totalToday: 0
			});

			const state = orderHistoryReducer(connectedState, action);

			expect(state.orders).toEqual([]);
			expect(state.error).toBe('Ошибка получения истории заказов');
		});

		test('should handle sendMessage', () => {
			const action = sendMessage({ type: 'test' });
			const state = orderHistoryReducer(initialState, action);

			// sendMessage пока не изменяет состояние
			expect(state).toEqual(initialState);
		});

		test('should handle disconnectFromOrderHistory', () => {
			const connectedState = {
				...initialState,
				isConnected: true,
				connectionUrl: 'ws://localhost:3001'
			};

			const action = disconnectFromOrderHistory();
			const state = orderHistoryReducer(connectedState, action);

			expect(state).toEqual({
				...connectedState,
				isConnecting: false,
				isConnected: false,
				connectionUrl: null
			});
		});

		test('should handle clearOrderHistory', () => {
			const stateWithOrders = {
				...initialState,
				orders: [mockOrder],
				error: 'Some error'
			};

			const action = clearOrderHistory();
			const state = orderHistoryReducer(stateWithOrders, action);

			expect(state).toEqual({
				...stateWithOrders,
				orders: [],
				error: null
			});
		});
	});

	describe('selectors', () => {
		const mockState = {
			orderHistory: {
				orders: [mockOrder, mockOrder2],
				isConnecting: false,
				isConnected: true,
				error: null,
				connectionUrl: 'ws://localhost:3001'
			}
		} as any;

		test('selectOrderHistoryOrders should return orders array', () => {
			const result = selectOrderHistoryOrders(mockState);
			expect(result).toEqual([mockOrder, mockOrder2]);
		});

		test('selectOrderHistoryLoading should return loading status', () => {
			const result = selectOrderHistoryLoading(mockState);
			expect(result).toBe(false);
		});

		test('selectOrderHistoryConnected should return connection status', () => {
			const result = selectOrderHistoryConnected(mockState);
			expect(result).toBe(true);
		});

		test('selectOrderHistoryError should return error message', () => {
			const result = selectOrderHistoryError(mockState);
			expect(result).toBeNull();
		});

		test('selectOrderHistoryError should return error when present', () => {
			const errorState = {
				orderHistory: {
					...mockState.orderHistory,
					error: 'Test error'
				}
			} as any;
			const result = selectOrderHistoryError(errorState);
			expect(result).toBe('Test error');
		});

		test('selectOrderHistoryOrderByNumber should return order by number', () => {
			const result = selectOrderHistoryOrderByNumber(mockState, 12345);
			expect(result).toEqual(mockOrder);
		});

		test('selectOrderHistoryOrderByNumber should return undefined for non-existent order', () => {
			const result = selectOrderHistoryOrderByNumber(mockState, 99999);
			expect(result).toBeUndefined();
		});

		test('selectOrderHistoryOrdersByStatus should return orders grouped by status', () => {
			const result = selectOrderHistoryOrdersByStatus(mockState);
			expect(result).toEqual({
				done: [mockOrder],
				pending: [mockOrder2],
				created: []
			});
		});
	});
});
