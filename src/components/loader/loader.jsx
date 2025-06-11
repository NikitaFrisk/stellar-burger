import styles from './loader.module.scss';
import PropTypes from 'prop-types';

export const Loader = ({ text = 'Загрузка...', size = 'medium' }) => {
	return (
		<div className={styles.container}>
			<div className={`${styles.spinner} ${styles[size]}`}>
				<div className={styles.dot}></div>
				<div className={styles.dot}></div>
				<div className={styles.dot}></div>
			</div>
			<p className={`${styles.text} text text_type_main-default text_color_inactive`}>
				{text}
			</p>
		</div>
	);
};

Loader.propTypes = {
	text: PropTypes.string,
	size: PropTypes.oneOf(['small', 'medium', 'large']),
}; 