import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../services/store';
import { logoutUser } from '../../services/auth/authSlice';
import styles from './profile-navigation.module.scss';

interface ProfileNavigationProps {
  className?: string;
}

export const ProfileNavigation: React.FC<ProfileNavigationProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isProfileActive = location.pathname === '/profile' || location.pathname === '/profile/';
  const isOrdersActive = location.pathname === '/profile/orders' || location.pathname.startsWith('/profile/orders/');

  return (
    <div className={`${styles.navigation} ${className || ''}`}>
      <div 
        className={`${styles.navItem} ${isProfileActive ? styles.active : styles.inactive}`}
        onClick={() => handleNavigation('/profile')}
      >
        Профиль
      </div>
      <div 
        className={`${styles.navItem} ${isOrdersActive ? styles.active : styles.inactive}`}
        onClick={() => handleNavigation('/profile/orders')}
      >
        История заказов
      </div>
      <div 
        className={`${styles.navItem} ${styles.inactive}`}
        onClick={handleLogout}
      >
        Выход
      </div>
      
      <div className={styles.description}>
        {isProfileActive && (
          <p>В этом разделе вы можете изменить свои персональные данные</p>
        )}
        {isOrdersActive && (
          <p>В этом разделе вы можете просмотреть свою историю заказов</p>
        )}
      </div>
    </div>
  );
};
