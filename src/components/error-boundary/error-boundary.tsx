import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorMessage } from '../ui';
import styles from './error-boundary.module.scss';

interface IErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface IErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

/**
 * Компонент для перехвата и обработки ошибок React
 * Предотвращает полное падение приложения
 */
export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
	constructor(props: IErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<IErrorBoundaryState> {
		// Обновляем состояние для отображения fallback UI
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Логируем ошибку
		console.error('ErrorBoundary caught an error:', error, errorInfo);
		
		// Обновляем состояние с информацией об ошибке
		this.setState({
			error,
			errorInfo,
		});

		// Вызываем callback если передан
		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}
	}

	handleReload = () => {
		// Перезагружаем страницу
		window.location.reload();
	};

	handleReset = () => {
		// Сбрасываем состояние ошибки
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	render() {
		if (this.state.hasError) {
			// Если передан custom fallback, используем его
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Иначе показываем стандартный UI ошибки
			return (
				<div className={styles.container}>
					<div className={styles.content}>
						<h1 className={styles.title}>Что-то пошло не так</h1>
						
						<ErrorMessage 
							error="Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу."
							variant="block"
						/>

						<div className={styles.actions}>
							<button 
								className={styles.button}
								onClick={this.handleReset}
								type="button"
							>
								Попробовать снова
							</button>
							<button 
								className={styles.button}
								onClick={this.handleReload}
								type="button"
							>
								Перезагрузить страницу
							</button>
						</div>

						{/* Детали ошибки (только в development) */}
						{process.env.NODE_ENV === 'development' && this.state.error && (
							<details className={styles.details}>
								<summary className={styles.summary}>
									Детали ошибки (только для разработки)
								</summary>
								<pre className={styles.errorDetails}>
									{this.state.error.toString()}
									{this.state.errorInfo?.componentStack}
								</pre>
							</details>
						)}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
} 