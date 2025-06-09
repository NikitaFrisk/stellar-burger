import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { IngredientDetails } from '../../components/ingredient-details/ingredient-details';
import { selectIngredients, selectIngredientsLoading, fetchIngredients } from '../../services/ingredients/ingredientsSlice';
import { setCurrentIngredient } from '../../services/ingredient-details/ingredientDetailsSlice';
import { Loader } from '../../components/loader/loader';
import styles from './ingredient.module.scss';

export const IngredientPage = () => {
	const { id } = useParams<{ id: string }>();
	const location = useLocation();
	const dispatch = useAppDispatch();
	const ingredients = useAppSelector(selectIngredients);
	const ingredientsLoading = useAppSelector(selectIngredientsLoading);

	// Проверяем, есть ли background (пришли с главной страницы)
	const background = location.state && location.state.background;

	useEffect(() => {
		// Если ингредиенты не загружены, загружаем их
		if (ingredients.length === 0 && !ingredientsLoading) {
			dispatch(fetchIngredients());
		}
	}, [ingredients.length, ingredientsLoading, dispatch]);

	useEffect(() => {
		if (id && ingredients.length > 0) {
			const ingredient = ingredients.find((item) => item._id === id);
			if (ingredient) {
				dispatch(setCurrentIngredient(ingredient));
			}
		}
	}, [id, ingredients, dispatch]);

	const currentIngredient = ingredients.find((item) => item._id === id);

	// Эта страница рендерится только при прямом переходе (без background)

	// Если ингредиенты загружаются или еще не загружены
	if (ingredientsLoading || ingredients.length === 0) {
		return (
			<div className={styles.container}>
				<div className={styles.loading}>
					<Loader text="Загружаем ингредиенты..." size="large" />
				</div>
			</div>
		);
	}

	// Если ингредиенты загружены, но нужный ингредиент не найден
	if (!currentIngredient) {
		return (
			<div className={styles.container}>
				<div className={styles.loading}>
					<p className='text text_type_main-large'>Ингредиент не найден</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<h1 className={`${styles.title} text text_type_main-large`}>
					Детали ингредиента
				</h1>
				<IngredientDetails ingredient={currentIngredient} />
			</div>
		</div>
	);
};
