import React from 'react';
import { COMPONENT_CLASSES } from '../../../utils/ui-classes';
import styles from './error-message.module.scss';

interface IErrorMessageProps {
	error: string;
	className?: string;
	variant?: 'inline' | 'block' | 'toast';
}

/**
 * Переиспользуемый компонент для отображения ошибок
 * Поддерживает разные варианты отображения
 */
export const ErrorMessage: React.FC<IErrorMessageProps> = ({
	error,
	className = '',
	variant = 'block',
}) => {
	if (!error) return null;

	const variantClass = styles[variant] || styles.block;
	const combinedClassName = `${styles.errorMessage} ${variantClass} ${className}`;

	return (
		<div className={`${combinedClassName} ${COMPONENT_CLASSES.STATUS.ERROR}`}>
			{error}
		</div>
	);
}; 