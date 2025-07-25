import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OrderCard } from '../../components/order-card/order-card';
import { Loader } from '../../components/loader/loader';
import { useAppDispatch, useAppSelector } from '../../services/store';
import {
  connectToOrderHistory,
  disconnectFromOrderHistory,
  selectOrderHistoryOrders,
  selectOrderHistoryLoading,
  selectOrderHistoryError,
  selectOrderHistoryConnected,
} from '../../services/order-history/orderHistorySlice';
import { selectIngredients } from '../../services/ingredients/ingredientsSlice';
import { selectUser } from '../../services/auth/authSlice';
import styles from './order-history.module.scss';

export const OrderHistoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // State для управления показом ошибки с задержкой
  const [showError, setShowError] = useState(false);
  const [connectionStartTime, setConnectionStartTime] = useState<number | null>(null);
  
  // Ref для отслеживания того, что соединение уже инициировано
  const connectionInitiated = useRef(false);

  const orders = useAppSelector(selectOrderHistoryOrders);
  const loading = useAppSelector(selectOrderHistoryLoading);
  const error = useAppSelector(selectOrderHistoryError);
  const connected = useAppSelector(selectOrderHistoryConnected);
  const ingredients = useAppSelector(selectIngredients);
  const user = useAppSelector(selectUser);

  // Управляем показом ошибки с задержкой
  useEffect(() => {
    let errorTimer: NodeJS.Timeout;

    if (error && connectionStartTime) {
      const timeSinceConnection = Date.now() - connectionStartTime;
      
      // Показываем ошибку только если прошло больше 5 секунд с момента подключения
      if (timeSinceConnection >= 5000) {
        setShowError(true);
      } else {
        // Устанавливаем таймер на оставшееся время
        errorTimer = setTimeout(() => {
          setShowError(true);
        }, 5000 - timeSinceConnection);
      }
    } else if (!error) {
      // Сбрасываем показ ошибки если ошибки нет
      setShowError(false);
    }

    return () => {
      if (errorTimer) {
        clearTimeout(errorTimer);
      }
    };
  }, [error, connectionStartTime]);

  useEffect(() => {
    // Записываем время начала подключения и сбрасываем флаг инициации при монтировании
    setConnectionStartTime(Date.now());
    setShowError(false);
    connectionInitiated.current = false;
    
    // Подключаемся к WebSocket для истории заказов пользователя
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken && user && !connectionInitiated.current) {
      connectionInitiated.current = true;
      
      // Удаляем "Bearer " из токена для WebSocket
      const token = accessToken.replace('Bearer ', '');
      
      const fullUrl = `wss://norma.nomoreparties.space/orders?token=${token}`;
      console.log('[OrderHistory] Connecting to WebSocket...');
      dispatch(connectToOrderHistory(fullUrl));
    }

    // Отключаемся при размонтировании
    return () => {
      console.log('[OrderHistory] Disconnecting from WebSocket...');
      dispatch(disconnectFromOrderHistory());
      connectionInitiated.current = false;
    };
  }, [dispatch, user]); // Убираем connected и loading из зависимостей

  const handleOrderClick = (orderNumber: number) => {
    navigate(`/profile/orders/${orderNumber}`, {
      state: { backgroundLocation: location }
    });
  };

  if (loading && orders.length === 0) {
    return <Loader text="Загрузка истории заказов..." size="large" />;
  }

  if (showError && error) {
    return (
      <div className={styles.error}>
        <h2>Ошибка загрузки истории заказов</h2>
        <p>{error}</p>
        <button onClick={() => {
          setConnectionStartTime(Date.now());
          setShowError(false);
          connectionInitiated.current = false;
          
          const accessToken = localStorage.getItem('accessToken');
          
          if (accessToken && !connectionInitiated.current) {
            connectionInitiated.current = true;
            const token = accessToken.replace('Bearer ', '');
            const fullUrl = `wss://norma.nomoreparties.space/orders?token=${token}`;
            
            dispatch(connectToOrderHistory(fullUrl));
          }
        }}>
          Попробовать снова
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>История заказов пуста</h2>
        <p>Вы еще не сделали ни одного заказа</p>
      </div>
    );
  }

  return (
    <div className={styles.orderHistoryPage}>
      <div className={styles.ordersList}>
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            ingredients={ingredients}
            showStatus={true}
            onClick={() => handleOrderClick(order.number)}
          />
        ))}
      </div>
    </div>
  );
};
