import { ReactNode } from 'react';
import { AppHeader } from '../app-header/app-header';
import styles from './layout.module.scss';

interface ILayoutProps {
	children: ReactNode;
	className?: string;
	withHeader?: boolean;
	maxWidth?: 'small' | 'medium' | 'large' | 'full';
	padding?: 'none' | 'small' | 'medium' | 'large';
}

/**
 * Универсальный компонент макета страницы
 * Обеспечивает консистентную структуру и отступы
 */
export const Layout: React.FC<ILayoutProps> = ({
	children,
	className = '',
	withHeader = true,
	maxWidth = 'large',
	padding = 'medium',
}) => {
	const containerClass = [
		styles.layout,
		styles[maxWidth],
		styles[`padding-${padding}`],
		className,
	].filter(Boolean).join(' ');

	return (
		<>
			{withHeader && <AppHeader />}
			<main className={containerClass}>
				{children}
			</main>
		</>
	);
}; 