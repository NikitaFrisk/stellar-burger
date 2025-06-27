import {
	ConstructorElement,
	Button,
	CurrencyIcon,
	DragIcon,
} from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-constructor.module.scss';
import { useCallback, useRef, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrop, useDrag } from 'react-dnd';
import {
	selectBun,
	selectIngredients,
	selectTotalPrice,
	setBun,
	addIngredientWithUuid,
	removeIngredient,
	moveIngredient,
} from '../../services/constructor/constructorSlice';
import {
	createOrder,
	selectOrderLoading,
} from '../../services/order/orderSlice';
import { selectIsAuthenticated } from '../../services/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { IIngredient, IConstructorIngredient } from '@utils/types';

interface IDraggableConstructorElementProps {
	item: IConstructorIngredient;
	index: number;
	handleRemove: (uuid: string) => void;
}

const DraggableConstructorElement: React.FC<IDraggableConstructorElementProps> = ({ 
	item, 
	index, 
	handleRemove 
}) => {
	const dispatch = useAppDispatch();
	const ref = useRef<HTMLDivElement>(null);

	const [{ isDragging }, drag] = useDrag({
		type: 'constructorElement',
		item: () => ({ index }),
		collect: (monitor: any) => ({
			isDragging: monitor.isDragging(),
		}),
	}) as any;

	const [, drop] = useDrop({
		accept: 'constructorElement',
		hover: (draggedItem: any) => {
			if (!ref.current) {
				return;
			}

			const dragIndex = draggedItem.index;
			const hoverIndex = index;

			if (dragIndex === hoverIndex) {
				return;
			}

			dispatch(
				moveIngredient({
					dragIndex,
					hoverIndex,
				})
			);

			draggedItem.index = hoverIndex;
		},
	}) as any;

	drag(drop(ref));

	return (
		<div
			className={styles.ingredient}
			ref={ref}
			style={{ opacity: isDragging ? 0.5 : 1 }}>
			<div className={styles.dragIcon}>
				<DragIcon type='primary' />
			</div>
			<ConstructorElement
				text={item.name}
				price={item.price}
				thumbnail={item.image}
				handleClose={() => handleRemove(item.uuid!)}
			/>
		</div>
	);
};

export const BurgerConstructor: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const totalPrice = useAppSelector(selectTotalPrice);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const orderLoading = useAppSelector(selectOrderLoading);
	const bun = useAppSelector(selectBun);
	const fillings = useAppSelector(selectIngredients);

	const [{ isHover }, dropTargetRef] = useDrop({
		accept: 'ingredient',
		drop: (item: IIngredient) => {
			if (item.type === 'bun') {
				dispatch(setBun(item));
			} else {
				dispatch(addIngredientWithUuid(item));
			}
		},
		collect: (monitor: any) => ({
			isHover: monitor.isOver(),
		}),
	}) as any;

	const handleRemoveIngredient = useCallback(
		(uuid: string) => {
			dispatch(removeIngredient(uuid));
		},
		[dispatch]
	);

	const handleOrderClick = useCallback(() => {
		if (!bun) return;

		if (!isAuthenticated) {
			navigate('/login');
			return;
		}

		const ingredientIds = [
			bun._id,
			...fillings.map((item) => item._id),
			bun._id,
		];

		dispatch(createOrder(ingredientIds));
	}, [dispatch, navigate, bun, fillings, isAuthenticated]);

	const containerStyle: CSSProperties = {
		border: isHover ? '1px dashed #4C4CFF' : 'none',
		borderRadius: '8px',
		padding: isHover ? '16px' : '16px 0',
		transition: 'all 0.2s ease',
	};

	const isOrderEnabled = bun && fillings.length > 0 && !orderLoading;

	return (
		<section className={styles.section}>
			<div
				className={styles.constructorElements}
				ref={dropTargetRef}
				style={containerStyle}>
				{bun ? (
					<div className={styles.bun}>
						<ConstructorElement
							type='top'
							isLocked={true}
							text={`${bun.name} (верх)`}
							price={bun.price}
							thumbnail={bun.image}
						/>
					</div>
				) : (
					<div className={`${styles.bun} ${styles.placeholder}`}>
						<p className='text text_type_main-default text_color_inactive'>
							Перетащите булку сюда
						</p>
					</div>
				)}

				{fillings.length > 0 ? (
					<div className={styles.scrollArea}>
						{fillings.map((item, index) => (
							<DraggableConstructorElement
								key={item.uuid}
								item={item}
								index={index}
								handleRemove={handleRemoveIngredient}
							/>
						))}
					</div>
				) : (
					<div className={`${styles.scrollArea} ${styles.placeholder}`}>
						<p className='text text_type_main-default text_color_inactive'>
							Перетащите начинки сюда
						</p>
					</div>
				)}

				{bun ? (
					<div className={`${styles.bun} ${styles.bunBottom}`}>
						<ConstructorElement
							type='bottom'
							isLocked={true}
							text={`${bun.name} (низ)`}
							price={bun.price}
							thumbnail={bun.image}
						/>
					</div>
				) : (
					<div
						className={`${styles.bun} ${styles.bunBottom} ${styles.placeholder}`}>
						<p className='text text_type_main-default text_color_inactive'>
							Перетащите булку сюда
						</p>
					</div>
				)}
			</div>

			<div className={styles.total}>
				<div className={styles.price}>
					<span className='text text_type_digits-medium'>{totalPrice}</span>
					<CurrencyIcon type='primary' />
				</div>
				<Button
					htmlType='button'
					type='primary'
					size='large'
					onClick={handleOrderClick}
					disabled={!isOrderEnabled}>
					{orderLoading
						? 'Оформляем заказ...'
						: isAuthenticated
						? 'Оформить заказ'
						: 'Войти для оформления'}
				</Button>
			</div>
		</section>
	);
};

export default BurgerConstructor; 