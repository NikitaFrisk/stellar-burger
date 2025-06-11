import {
	Counter,
	CurrencyIcon,
} from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './ingredient-card.module.scss';
import { useDrag } from 'react-dnd';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { setCurrentIngredient } from '../../services/ingredient-details/ingredientDetailsSlice';
import { selectBun, selectIngredients } from '../../services/constructor/constructorSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { IngredientType } from '@utils/types';

const IngredientCard = ({ ingredient, onClick }) => {
	const constructorIngredients = useAppSelector(selectIngredients);
	const constructorBun = useAppSelector(selectBun);
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const count =
		ingredient.type === 'bun'
			? constructorBun && constructorBun._id === ingredient._id
				? 1
				: 0
			: constructorIngredients.filter((item) => item._id === ingredient._id)
					.length;

	const [{ isDragging }, dragRef] = useDrag({
		type: 'ingredient',
		item: ingredient,
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const handleClick = (e) => {
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
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick(e);
		}
	};

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

IngredientCard.propTypes = {
	ingredient: IngredientType.isRequired,
	onClick: PropTypes.func,
};

export default IngredientCard;
