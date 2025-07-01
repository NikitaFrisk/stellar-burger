import { Link } from 'react-router-dom';
import { Button } from '@ya.praktikum/react-developer-burger-ui-components';
import { COMPONENT_CLASSES } from '../../utils/ui-classes';
import styles from './not-found.module.scss';

export const NotFoundPage = () => {
	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<h1 className={`${COMPONENT_CLASSES.STATUS.ERROR} mb-8`}>404</h1>
				<p className={`${COMPONENT_CLASSES.STATUS.NOT_FOUND} mb-8`}>Страница не найдена</p>
				<p className={`${COMPONENT_CLASSES.AUTH_FORM.LINK_TEXT} mb-20`}>
					Запрашиваемая страница не существует или была удалена
				</p>
				<Link to='/'>
					<Button htmlType='button' type='primary' size='large'>
						На главную
					</Button>
				</Link>
			</div>
		</div>
	);
};
