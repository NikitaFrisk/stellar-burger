import { useAppSelector } from '../services/store';
import {
	selectOrder,
	selectOrderLoading,
	selectOrderError,
} from '../services/order/orderSlice';

/**
 * Хук для работы с состоянием заказов
 * Консолидирует все селекторы заказов в одном месте
 */
export const useOrder = () => {
	const order = useAppSelector(selectOrder);
	const loading = useAppSelector(selectOrderLoading);
	const error = useAppSelector(selectOrderError);

	return {
		order,
		loading,
		error,
	};
}; 