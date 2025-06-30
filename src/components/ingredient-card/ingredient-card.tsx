import {
	CurrencyIcon,
} from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './ingredient-card.module.scss';
import { useDrag } from 'react-dnd';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { setCurrentIngredient } from '../../services/ingredient-details/ingredientDetailsSlice';
import {
	selectBun,
	selectIngredients,
} from '../../services/constructor/constructorSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { IIngredient } from '@utils/types';
import { memo, useMemo, useCallback } from 'react';

interface IIngredientCardProps {
	ingredient: IIngredient;
	onClick?: () => void;
}

const IngredientCard: React.FC<IIngredientCardProps> = ({ ingredient, onClick }) => {
	const constructorIngredients = useAppSelector(selectIngredients);
	const constructorBun = useAppSelector(selectBun);
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	// Мемоизируем вычисление счетчика
	const count = useMemo(() => {
		if (ingredient.type === 'bun') {
			return constructorBun && constructorBun._id === ingredient._id ? 1 : 0;
		}
		return constructorIngredients.filter((item) => item._id === ingredient._id).length;
	}, [ingredient._id, ingredient.type, constructorBun, constructorIngredients]);

	const [{ isDragging }, dragRef] = useDrag({
		type: 'ingredient',
		item: () => ingredient,
		collect: (monitor: any) => ({
			isDragging: monitor.isDragging(),
		}),
	}) as any;

	const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		dispatch(setCurrentIngredient(ingredient));
		if (onClick) {
			onClick();
		}
		// Сохраняем, что это переход из модалки для сохранения при обновлении
		sessionStorage.setItem('modalIngredient', ingredient._id);
		navigate(`/ingredients/${ingredient._id}`, {
			state: { background: location },
		});
	}, [dispatch, ingredient, onClick, navigate, location]);

	const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			// Вызываем ту же логику, что и в handleClick, но без события мыши
			dispatch(setCurrentIngredient(ingredient));
			if (onClick) {
				onClick();
			}
			sessionStorage.setItem('modalIngredient', ingredient._id);
			navigate(`/ingredients/${ingredient._id}`, {
				state: { background: location },
			});
		}
	}, [dispatch, ingredient, onClick, navigate, location]);

	return (
		<div
			className={styles.card}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role='button'
			tabIndex={0}
			ref={dragRef}
			style={{ opacity: isDragging ? 0.5 : 1 }}>
			<img src={ingredient.image} alt={ingredient.name} />
			{count > 0 && <div className={styles.count}>{count}</div>}
			<div className={styles.price}>
				<span className='text text_type_digits-default'>
					{ingredient.price}
				</span>
				<CurrencyIcon type='primary' />
			</div>
			<p className={`${styles.name} text text_type_main-default`}>
				{ingredient.name}
			</p>
		</div>
	);
};

// Мемоизируем компонент с оптимизированным сравнением
export default memo(IngredientCard, (prevProps: IIngredientCardProps, nextProps: IIngredientCardProps) => {
	// Компонент перерендеривается только если изменился сам ингредиент или callback
	return (
		prevProps.ingredient._id === nextProps.ingredient._id &&
		prevProps.onClick === nextProps.onClick
	);
}); 