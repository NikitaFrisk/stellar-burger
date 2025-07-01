import { useAppSelector } from '../services/store';
import {
	selectIngredients,
	selectIngredientsLoading,
	selectIngredientsError,
} from '../services/ingredients/ingredientsSlice';

/**
 * Хук для работы с состоянием ингредиентов
 * Консолидирует все селекторы ингредиентов в одном месте
 */
export const useIngredients = () => {
	const ingredients = useAppSelector(selectIngredients);
	const loading = useAppSelector(selectIngredientsLoading);
	const error = useAppSelector(selectIngredientsError);

	return {
		ingredients,
		loading,
		error,
	};
}; 