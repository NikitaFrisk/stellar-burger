import { useAppSelector } from '../services/store';
import {
	selectBun,
	selectIngredients as selectConstructorIngredients,
	selectTotalPrice,
} from '../services/constructor/constructorSlice';

/**
 * Хук для работы с состоянием конструктора бургера
 * Консолидирует все селекторы конструктора в одном месте
 */
export const useConstructor = () => {
	const bun = useAppSelector(selectBun);
	const ingredients = useAppSelector(selectConstructorIngredients);
	const totalPrice = useAppSelector(selectTotalPrice);

	return {
		bun,
		ingredients,
		totalPrice,
	};
}; 