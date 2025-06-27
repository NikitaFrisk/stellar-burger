import styles from './modal-overlay.module.scss';

interface IModalOverlayProps {
	onClick: () => void;
}

export const ModalOverlay: React.FC<IModalOverlayProps> = ({ onClick }) => {
	return (
		<div 
			className={styles.overlay} 
			onClick={onClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					onClick();
				}
			}}
		></div>
	);
}; 