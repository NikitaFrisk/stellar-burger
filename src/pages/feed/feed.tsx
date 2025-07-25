import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OrderCard } from '../../components/order-card/order-card';
import { OrderStats } from '../../components/order-stats/order-stats';
import { Loader } from '../../components/loader/loader';
import { useAppDispatch, useAppSelector } from '../../services/store';
import {
  connectToFeed,
  disconnectFromFeed,
  selectFeedOrders,
  selectFeedTotal,
  selectFeedTotalToday,
  selectFeedOrdersByStatus,
  selectFeedLoading,
  selectFeedError,
} from '../../services/feed/feedSlice';
import { selectIngredients } from '../../services/ingredients/ingredientsSlice';
import styles from './feed.module.scss';

export const FeedPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // State для управления показом ошибки с задержкой
  const [showError, setShowError] = useState(false);
  const [connectionStartTime, setConnectionStartTime] = useState<number | null>(null);

  const orders = useAppSelector(selectFeedOrders);
  const total = useAppSelector(selectFeedTotal);
  const totalToday = useAppSelector(selectFeedTotalToday);
  const ordersByStatus = useAppSelector(selectFeedOrdersByStatus);
  const loading = useAppSelector(selectFeedLoading);
  const error = useAppSelector(selectFeedError);
  const ingredients = useAppSelector(selectIngredients);

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
    // Записываем время начала подключения
    setConnectionStartTime(Date.now());
    setShowError(false);
    
    // Подключаемся к WebSocket для ленты заказов
    dispatch(connectToFeed({ 
      url: 'wss://norma.nomoreparties.space/orders/all' 
    }));

    // Отключаемся при размонтировании
    return () => {
      dispatch(disconnectFromFeed());
    };
  }, [dispatch]);

  const handleOrderClick = (orderNumber: number) => {
    navigate(`/feed/${orderNumber}`, {
      state: { backgroundLocation: location }
    });
  };

  if (loading && orders.length === 0) {
    return <Loader text="Загрузка ленты заказов..." size="large" />;
  }

  if (showError && error) {
    return (
      <div className={styles.error}>
        <h2>Ошибка загрузки ленты заказов</h2>
        <p>{error}</p>
        <button onClick={() => {
          setConnectionStartTime(Date.now());
          setShowError(false);
          dispatch(connectToFeed({ 
            url: 'wss://norma.nomoreparties.space/orders/all' 
          }));
        }}>
          Попробовать снова
        </button>
      </div>
    );
  }

  // Подготавливаем данные для статистики
  const doneOrderNumbers = ordersByStatus.done.map(order => order.number);
  const pendingOrderNumbers = ordersByStatus.pending.map(order => order.number);

  return (
    <div className={styles.feedPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Лента заказов</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.ordersSection}>
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                ingredients={ingredients}
                showStatus={false}
                onClick={() => handleOrderClick(order.number)}
              />
            ))}
          </div>
        </div>

        <div className={styles.statsSection}>
          <OrderStats
            doneOrders={doneOrderNumbers}
            pendingOrders={pendingOrderNumbers}
            totalCompleted={total}
            todayCompleted={totalToday}
          />
        </div>
      </div>
    </div>
  );
};
