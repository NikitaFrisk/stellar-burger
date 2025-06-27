import { ReactNode, FormEvent } from 'react';
import { Button } from '@ya.praktikum/react-developer-burger-ui-components';
import { useAuth } from '../../hooks/useAuth';
import { ErrorMessage } from '../ui';
import { COMPONENT_CLASSES } from '../../utils/ui-classes';
import styles from './auth-form.module.scss';

interface IAuthFormProps {
	title: string;
	children: ReactNode;
	onSubmit: (e: FormEvent) => void;
	buttonText: string;
	loadingText: string;
	isValid: boolean;
	links?: ReactNode;
}

/**
 * Универсальный компонент формы аутентификации
 * Устраняет дублирование кода между формами login, register, forgot-password и т.д.
 */
export const AuthForm: React.FC<IAuthFormProps> = ({
	title,
	children,
	onSubmit,
	buttonText,
	loadingText,
	isValid,
	links,
}) => {
	const { loading, error } = useAuth();

	return (
		<div className={styles.container}>
			<form className={styles.form} onSubmit={onSubmit}>
				<h1 className={COMPONENT_CLASSES.AUTH_FORM.TITLE}>{title}</h1>

				<ErrorMessage error={error || ''} />

				<div className={styles.inputGroup}>{children}</div>

				<Button
					htmlType='submit'
					type='primary'
					size='medium'
					extraClass={styles.button}
					disabled={loading || !isValid}>
					{loading ? loadingText : buttonText}
				</Button>

				{links && <div className={styles.links}>{links}</div>}
			</form>
		</div>
	);
}; 