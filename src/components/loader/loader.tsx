import styles from './loader.module.scss';

interface ILoaderProps {
	text?: string;
	size?: 'small' | 'medium' | 'large';
}

export const Loader: React.FC<ILoaderProps> = ({ text = 'Загрузка...', size = 'medium' }) => {
	return (
		<div className={styles.container}>
			<div className={`${styles.spinner} ${styles[size]}`}>
				<div className={styles.dot}></div>
				<div className={styles.dot}></div>
				<div className={styles.dot}></div>
			</div>
			<p
				className={`${styles.text} text text_type_main-default text_color_inactive`}>
				{text}
			</p>
		</div>
	);
}; 