import { CheckMarkIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './order-details.module.scss';

interface IOrderDetailsProps {
	orderNumber: number;
}

export const OrderDetails: React.FC<IOrderDetailsProps> = ({ orderNumber }) => {
	return (
		<div className={styles.container} data-testid="order-details">
			<p className={styles.orderNumber} data-testid="order-number">{orderNumber}</p>
			<p className={`${styles.title} text text_type_main-medium mt-8`}>
				идентификатор заказа
			</p>
			<div className={styles.iconContainer}>
				<div className={styles.iconBackground}>
					<CheckMarkIcon type='primary' />
				</div>
			</div>
			<p className={`${styles.description} text text_type_main-default`}>
				Ваш заказ начали готовить
			</p>
			<p
				className={`${styles.additionalInfo} text text_type_main-default text_color_inactive`}>
				Дождитесь готовности на орбитальной станции
			</p>
		</div>
	);
}; 