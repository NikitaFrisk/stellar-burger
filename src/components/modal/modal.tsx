import { CloseIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { ModalOverlay } from '../modal-overlay/modal-overlay';
import { createPortal } from 'react-dom';
import styles from './modal.module.scss';
import { useEffect, ReactNode } from 'react';

interface IModalProps {
	children: ReactNode;
	title?: string;
	onClose: () => void;
	closable?: boolean;
}

export const Modal: React.FC<IModalProps> = ({ children, title, onClose, closable = true }) => {
	useEffect(() => {
		const handleEscKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && closable) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscKeydown);

		return () => {
			document.removeEventListener('keydown', handleEscKeydown);
		};
	}, [onClose, closable]);

	const modalRoot = document.getElementById('modals');

	if (!modalRoot) {
		return null;
	}

	return createPortal(
		<>
			<ModalOverlay onClick={closable ? onClose : () => {}} />
			<div className={styles.modal} data-testid="modal">
				<div className={styles.header}>
					<h2 className={`${styles.title} text text_type_main-large`}>
						{title}
					</h2>
					{closable && (
						<button className={styles.closeButton} onClick={onClose} data-testid="modal-close">
							<CloseIcon type='primary' />
						</button>
					)}
				</div>
				<div className={styles.content}>{children}</div>
			</div>
		</>,
		modalRoot
	);
}; 