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
import {
  fetchOrderByNumber,
  selectOrderDetailsOrder,
  selectOrderDetailsLoading,
  selectOrderDetailsError,
  clearOrderDetails
} from '../../services/order-details/orderDetailsSlice';
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
  
  // Получаем номер заказа из URL параметров или из самого заказа
  const orderNumberFromParams = number ? parseInt(number) : 0;

  // State для управления показом ошибки с задержкой
  const [showError, setShowError] = useState(false);
  const [connectionStartTime, setConnectionStartTime] = useState<number | null>(null);

  const ingredients = useAppSelector(selectIngredients);
  const user = useAppSelector(selectUser);

  // Определяем, является ли это заказом из профиля
  const isProfileOrder = location.pathname.includes('/profile/orders');
  
  // Пытаемся найти заказ в ленте заказов
  const feedOrder = useAppSelector(state => 
    selectFeedOrderByNumber(state, orderNumberFromParams)
  );
  
  // Пытаемся найти заказ в истории пользователя
  const userOrder = useAppSelector(state => 
    selectOrderHistoryOrderByNumber(state, orderNumberFromParams)
  );

  // Заказ из прямого API-запроса
  const apiOrder = useAppSelector(selectOrderDetailsOrder);

  // Состояния загрузки
  const feedLoading = useAppSelector(selectFeedLoading);
  const feedError = useAppSelector(selectFeedError);
  const orderHistoryLoading = useAppSelector(selectOrderHistoryLoading);
  const orderHistoryError = useAppSelector(selectOrderHistoryError);
  const apiLoading = useAppSelector(selectOrderDetailsLoading);
  const apiError = useAppSelector(selectOrderDetailsError);

  // Выбираем актуальный заказ - сначала из WebSocket, потом из API
  const order: IFeedOrder | undefined | null = isProfileOrder ? 
    (userOrder || apiOrder) : 
    (feedOrder || apiOrder);
  
  // Получаем правильный номер заказа: из самого заказа, если он есть, иначе из URL
  const orderNumber = order?.number || orderNumberFromParams;
  
  // Определяем состояние загрузки и ошибки
  const isLoading = useMemo(() => {
    // Если есть заказ, то не загружаемся
    if (order) return false;
    
    // Для profile orders полагаемся только на API загрузку
    if (isProfileOrder) {
      return apiLoading;
    }
    
    // Для feed orders - проверяем все источники
    // Если есть API ошибка и WebSocket ошибка, то не загружаемся
    if (apiError && feedError) return false;
    
    // Если прошло больше 10 секунд и нет заказа, прекращаем загрузку
    if (connectionStartTime && (Date.now() - connectionStartTime > 10000)) {
      return false;
    }
    
    // Иначе загружаемся, если есть активная загрузка
    return feedLoading || apiLoading;
  }, [order, apiError, apiLoading, isProfileOrder, feedError, feedLoading, connectionStartTime]);
  
  const error = isProfileOrder ? 
    apiError : 
    (feedError || apiError);  // Управляем показом ошибки с задержкой
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

    // Очищаем предыдущие данные API
    dispatch(clearOrderDetails());

    if (isProfileOrder) {
      // Для заказов профиля ВСЕГДА сначала делаем API запрос
      // Это гарантирует получение данных даже при проблемах с WebSocket/токенами
      console.log('[OrderInfo] Making direct API request for profile order...');
      dispatch(fetchOrderByNumber(orderNumberFromParams));
      
      // WebSocket подключение делаем только если пользователь точно авторизован
      // и через небольшую задержку, чтобы не мешать API запросу
      setTimeout(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken && user) {
          const token = accessToken.replace('Bearer ', '');
          const fullUrl = `wss://norma.nomoreparties.space/orders?token=${token}`;
          console.log('[OrderInfo] Connecting to order history WebSocket...');
          dispatch(connectToOrderHistory(fullUrl));
        }
      }, 1000); // Задержка в 1 секунду
    } else {
      // Для заказов ленты подключаемся к общей ленте
      console.log('[OrderInfo] Connecting to feed WebSocket...');
      dispatch(connectToFeed('wss://norma.nomoreparties.space/orders/all'));
    }

    // Отключаемся при размонтировании компонента
    return () => {
      console.log('[OrderInfo] Disconnecting from WebSocket...');
      if (isProfileOrder) {
        dispatch(disconnectFromOrderHistory());
      } else {
        dispatch(disconnectFromFeed());
      }
      dispatch(clearOrderDetails());
    };
  }, [dispatch, isProfileOrder, user, orderNumberFromParams]); // Используем orderNumberFromParams

  // Эффект для прямого API-запроса, если заказ не найден в WebSocket данных
  useEffect(() => {
    // Только для feed orders (для profile orders API запрос уже делается сразу)
    if (isProfileOrder) return;
    
    // Ждем 5 секунд после подключения к WebSocket
    const timer = setTimeout(() => {
      const wsOrder = feedOrder;
      
      // Если заказ не найден в WebSocket данных и нет активной загрузки API и нет полученного API заказа
      if (!wsOrder && !apiOrder && !apiLoading && connectionStartTime) {
        console.log(`[OrderInfo] Feed order ${orderNumberFromParams} not found in WebSocket data after 5 seconds, making direct API request`);
        dispatch(fetchOrderByNumber(orderNumberFromParams));
      }
    }, 5000); // Увеличиваем время до 5 секунд

    return () => clearTimeout(timer);
  }, [dispatch, orderNumberFromParams, feedOrder, apiOrder, apiLoading, isProfileOrder, connectionStartTime]);

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
          <p>Заказ #{orderNumberFromParams} не существует или недоступен</p>
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
