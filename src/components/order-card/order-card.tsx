import React from 'react';
import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { IFeedOrder, IIngredient } from '../../utils/types';
import styles from './order-card.module.scss';

interface OrderCardProps {
	order: IFeedOrder;
	ingredients: IIngredient[];
	showStatus?: boolean;
	onClick?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
	order,
	ingredients,
	showStatus = true,
	onClick
}) => {
	const maxVisibleIngredients = 6;

	// Получаем ингредиенты заказа с их данными
	const orderIngredients = order.ingredients
		.map(ingredientId => ingredients.find(ingredient => ingredient._id === ingredientId))
		.filter(Boolean) as IIngredient[];

	// Подсчитываем общую стоимость
	const totalPrice = orderIngredients.reduce((sum, ingredient) => sum + ingredient.price, 0);

	// Видимые ингредиенты и количество скрытых
	const visibleIngredients = orderIngredients.slice(0, maxVisibleIngredients);
	const hiddenCount = orderIngredients.length - maxVisibleIngredients;

	// Форматирование номера заказа
	const formatOrderId = (number: number) => {
		return `#${number.toString().padStart(6, '0')}`;
	};

	// Получение текста статуса
	const getStatusText = (status: string) => {
		switch (status) {
			case 'done':
				return 'Выполнен';
			case 'pending':
				return 'Готовится';
			case 'created':
				return 'Создан';
			default:
				return '';
		}
	};

	// Получение класса для статуса
	const getStatusClass = (status: string) => {
		switch (status) {
			case 'done':
				return styles.statusDone;
			case 'pending':
				return styles.statusPending;
			case 'created':
				return styles.statusCreated;
			default:
				return '';
		}
	};

	// Форматирование времени
	const formatTimestamp = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffTime = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		const timeString = date.toLocaleTimeString('ru-RU', { 
			hour: '2-digit', 
			minute: '2-digit'
		});

		if (diffDays === 0) {
			return `Сегодня, ${timeString}`;
		} else if (diffDays === 1) {
			return `Вчера, ${timeString}`;
		} else if (diffDays <= 7) {
			return `${diffDays} дня назад, ${timeString}`;
		} else {
			return date.toLocaleDateString('ru-RU') + `, ${timeString}`;
		}
	};

	return (
		<div className={styles.orderCard} onClick={onClick}>
			<div className={styles.orderHeader}>
				<span className={styles.orderId}>{formatOrderId(order.number)}</span>
				<span className={styles.timestamp}>{formatTimestamp(order.createdAt)}</span>
			</div>

			<div className={styles.orderInfo}>
				<h3 className={styles.burgerName}>{order.name}</h3>
				{showStatus && (
					<div className={`${styles.status} ${getStatusClass(order.status)}`}>
						{getStatusText(order.status)}
					</div>
				)}
			</div>

			<div className={styles.orderFooter}>
				<div className={styles.ingredients}>
					{visibleIngredients.map((ingredient, index) => {
						const isLast = index === maxVisibleIngredients - 1;
						const shouldShowMore = isLast && hiddenCount > 0;

						return (
							<div
								key={ingredient._id + index}
								className={styles.ingredientPreview}
								style={{ zIndex: maxVisibleIngredients - index }}
							>
								<img 
									src={ingredient.image} 
									alt={ingredient.name}
									className={styles.ingredientImage}
								/>
								{shouldShowMore && (
									<div className={styles.moreOverlay}>
										<span className={styles.moreCount}>+{hiddenCount}</span>
									</div>
								)}
							</div>
						);
					})}
				</div>
				<div className={styles.price}>
					<span className={styles.priceValue}>{totalPrice}</span>
					<div className={styles.priceIcon}>
						<CurrencyIcon type="primary" />
					</div>
				</div>
			</div>
		</div>
	);
};
