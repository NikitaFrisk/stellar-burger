import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { rootReducer } from './reducers';

const stateLogger = (store: any) => (next: any) => (action: any) => {
	console.log('----------------------------');
	console.log(`Action: ${action.type}`);

	const beforeState = store.getState();
	console.log('State structure before:', Object.keys(beforeState));

	if (action.type.startsWith('constructor/')) {
		console.log('Constructor state before:', beforeState.constructor);
		console.log('Payload:', action.payload);
	}

	try {
		const result = next(action);

		const afterState = store.getState();
		console.log('State structure after:', Object.keys(afterState));

		if (action.type.startsWith('constructor/')) {
			console.log('Constructor state after:', afterState.constructor);
		}

		console.log('Action completed successfully');
		return result;
	} catch (error) {
		console.error('!!!Error in action execution:', error);
		throw error;
	}
};

const crashReporter = (store: any) => (next: any) => (action: any) => {
	try {
		return next(action);
	} catch (err: any) {
		console.error('!!!REDUCER ERROR:', err);
		console.error(
			'!!!State keys at time of error:',
			Object.keys(store.getState())
		);
		console.error('!!!Full error state:', store.getState());
		console.error('!!!Action that caused error:', action);

		return next({ type: 'ERROR_HANDLED', error: err.message });
	}
};

export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}).concat(crashReporter, stateLogger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Типизированные хуки
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 