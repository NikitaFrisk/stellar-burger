import React from 'react';
import { COMPONENT_CLASSES } from '../../../utils/ui-classes';
import styles from './loading-spinner.module.scss';

interface ILoadingSpinnerProps {
	size?: 'small' | 'medium' | 'large';
	text?: string;
	centered?: boolean;
	className?: string;
}

/**
 * Переиспользуемый компонент спиннера загрузки
 * Поддерживает разные размеры и позиционирование
 */
export const LoadingSpinner: React.FC<ILoadingSpinnerProps> = ({
	size = 'medium',
	text = 'Загрузка...',
	centered = true,
	className = '',
}) => {
	const containerClass = `${styles.container} ${centered ? styles.centered : ''} ${className}`;
	const spinnerClass = `${styles.spinner} ${styles[size]}`;

	return (
		<div className={containerClass}>
			<div className={spinnerClass}></div>
			{text && (
				<p className={`${styles.text} ${COMPONENT_CLASSES.STATUS.LOADING}`}>
					{text}
				</p>
			)}
		</div>
	);
}; 