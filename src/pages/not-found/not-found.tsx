import { Link } from 'react-router-dom';
import { Button } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './not-found.module.scss';

export const NotFoundPage = () => {
	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<h1 className='text text_type_digits-large mb-8'>404</h1>
				<p className='text text_type_main-medium mb-8'>Страница не найдена</p>
				<p className='text text_type_main-default text_color_inactive mb-20'>
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
