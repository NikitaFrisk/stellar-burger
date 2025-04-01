import { CloseIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { ModalOverlay } from '../modal-overlay/modal-overlay';
import { createPortal } from 'react-dom';
import styles from './modal.module.scss';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

export const Modal = ({ children, title, onClose }) => {
    useEffect(() => {
        const handleEscKeydown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKeydown);

        return () => {
            document.removeEventListener('keydown', handleEscKeydown);
        };
    }, [onClose]);

    // Get the modal root element at render time, not at module load time
    const modalRoot = document.getElementById('modals');

    if (!modalRoot) {
        return null; // Handle case when modal root isn't available yet
    }

    return createPortal(
        <>
            <ModalOverlay onClick={onClose} />
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={`${styles.title} text text_type_main-large`}>{title}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <CloseIcon type="primary" />
                    </button>
                </div>
                <div className={styles.content}>{children}</div>
            </div>
        </>,
        modalRoot
    );
};

Modal.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};