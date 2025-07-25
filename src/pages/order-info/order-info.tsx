import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { OrderIngredientItem } from '../../components/order-ingredient-item/order-ingredient-item';
import { Loader } from '../../components/loader/loader';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { 
  selectFeedOrderByNumber,
  connectToFeed,
  disconnectFromFeed,
  selectFeedLoading,
  selectFeedError
} from '../../services/feed/feedSlice';
import { 
  selectOrderHistoryOrderByNumber,
  connectToOrderHistory,
  disconnectFromOrderHistory,
  selectOrderHistoryLoading,
  selectOrderHistoryError
} from '../../services/order-history/orderHistorySlice';
import { selectIngredients } from '../../services/ingredients/ingredientsSlice';
import { selectUser } from '../../services/auth/authSlice';
import { IIngredient, IFeedOrder } from '../../utils/types';
import styles from './order-info.module.scss';

// Интерфейс для ингредиента с количеством
interface IngredientWithCount {
  ingredient: IIngredient;
  count: number;
}

interface OrderInfoPageProps {
  hideOrderNumber?: boolean; // Флаг для скрытия номера заказа (в модальном режиме)
}

export const OrderInfoPage: React.FC<OrderInfoPageProps> = ({ hideOrderNumber = false }) => {
  const { number } = useParams<{ number: string }>();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const orderNumber = number ? parseInt(number) : 0;

  // State для управления показом ошибки с задержкой
  const [showError, setShowError] = useState(false);
  const [connectionStartTime, setConnectionStartTime] = useState<number | null>(null);

  const ingredients = useAppSelector(selectIngredients);
  const user = useAppSelector(selectUser);
  
  // Определяем, является ли это заказом из профиля
  const isProfileOrder = location.pathname.includes('/profile/orders');
  
  // Пытаемся найти заказ в ленте заказов
  const feedOrder = useAppSelector(state => 
    selectFeedOrderByNumber(state, orderNumber)
  );
  
  // Пытаемся найти заказ в истории пользователя
  const userOrder = useAppSelector(state => 
    selectOrderHistoryOrderByNumber(state, orderNumber)
  );

  // Состояния загрузки
  const feedLoading = useAppSelector(selectFeedLoading);
  const feedError = useAppSelector(selectFeedError);
  const orderHistoryLoading = useAppSelector(selectOrderHistoryLoading);
  const orderHistoryError = useAppSelector(selectOrderHistoryError);

  // Выбираем актуальный заказ
  const order: IFeedOrder | undefined = isProfileOrder ? userOrder : feedOrder;
  
  // Определяем состояние загрузки и ошибки
  const isLoading = isProfileOrder ? orderHistoryLoading : feedLoading;
  const error = isProfileOrder ? orderHistoryError : feedError;

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

  // Подключаемся к соответствующему WebSocket при загрузке компонента
  useEffect(() => {
    // Записываем время начала подключения
    setConnectionStartTime(Date.now());
    setShowError(false);

    if (isProfileOrder) {
      // Для заказов профиля подключаемся к истории заказов
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken && user) {
        const token = accessToken.replace('Bearer ', '');
        dispatch(connectToOrderHistory({ 
          url: 'wss://norma.nomoreparties.space/orders',
          token: token
        }));
      }
    } else {
      // Для заказов ленты подключаемся к общей ленте
      dispatch(connectToFeed({ 
        url: 'wss://norma.nomoreparties.space/orders/all' 
      }));
    }

    // Отключаемся при размонтировании компонента
    return () => {
      if (isProfileOrder) {
        dispatch(disconnectFromOrderHistory());
      } else {
        dispatch(disconnectFromFeed());
      }
    };
  }, [dispatch, isProfileOrder, user]);

  // Обрабатываем ингредиенты с подсчетом количества
  const processedIngredients = useMemo(() => {
    if (!order || !ingredients.length) return [];

    const ingredientCounts: { [key: string]: number } = {};
    
    // Подсчитываем количество каждого ингредиента
    order.ingredients.forEach(id => {
      ingredientCounts[id] = (ingredientCounts[id] || 0) + 1;
    });
    
    // Создаем массив ингредиентов с количеством
    return Object.entries(ingredientCounts)
      .map(([id, count]) => {
        const ingredient = ingredients.find(item => item._id === id);
        return ingredient ? { ingredient, count } : null;
      })
      .filter(Boolean) as IngredientWithCount[];
  }, [order, ingredients]);

  // Подсчитываем общую стоимость
  const totalPrice = useMemo(() => {
    return processedIngredients.reduce((sum, item) => 
      sum + (item.ingredient.price * item.count), 0
    );
  }, [processedIngredients]);

  // Функция для получения текста статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'done':
        return 'Выполнен';
      case 'pending':
        return 'Готовится';
      case 'created':
        return 'Создан';
      default:
        return 'Неизвестно';
    }
  };

  // Функция для получения класса статуса
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'done':
        return styles.statusDone;
      case 'pending':
        return styles.statusPending;
      case 'created':
        return styles.statusCreated;
      default:
        return '';
    }
  };

  // Форматирование времени
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const timeString = date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Moscow'
    });

    if (diffDays === 0) {
      return `Сегодня, ${timeString} i-GMT+3`;
    } else if (diffDays === 1) {
      return `Вчера, ${timeString} i-GMT+3`;
    } else if (diffDays <= 7) {
      return `${diffDays} дня назад, ${timeString} i-GMT+3`;
    } else {
      return date.toLocaleDateString('ru-RU') + `, ${timeString} i-GMT+3`;
    }
  };

  if (isLoading && !order) {
    return (
      <div className={styles.container}>
        <Loader text="Загрузка информации о заказе..." size="large" />
      </div>
    );
  }

  if (showError && !order) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Ошибка загрузки заказа</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!order && !isLoading && !error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Заказ не найден</h2>
          <p>Заказ #{orderNumber} не существует или недоступен</p>
        </div>
      </div>
    );
  }

  // Если заказ не найден, продолжаем показывать загрузку
  if (!order) {
    return (
      <div className={styles.container}>
        <Loader text="Загрузка информации о заказе..." size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.orderInfo}>
        {!hideOrderNumber && (
          <div className={styles.orderNumber}>
            #{orderNumber.toString().padStart(6, '0')}
          </div>
        )}
        
        <div className={styles.orderName}>
          {order.name}
        </div>
        
        <div className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
          {getStatusText(order.status)}
        </div>
        
        <div className={styles.compositionTitle}>
          Состав:
        </div>
        
        <div className={styles.ingredientsList}>
          {processedIngredients.map((item, index) => (
            <OrderIngredientItem
              key={item.ingredient._id + index}
              ingredient={item.ingredient}
              count={item.count}
            />
          ))}
        </div>
        
        <div className={styles.footer}>
          <div className={styles.timestamp}>
            {formatTimestamp(order.createdAt)}
          </div>
          
          <div className={styles.totalPrice}>
            <span className={styles.priceValue}>{totalPrice}</span>
            <div className={styles.priceIcon}>
              <CurrencyIcon type="primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
