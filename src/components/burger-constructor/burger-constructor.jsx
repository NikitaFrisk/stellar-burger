import { ConstructorElement, Button, CurrencyIcon, DragIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-constructor.module.scss';
import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrop, useDrag } from 'react-dnd';
import { selectBun, selectIngredients, selectTotalPrice, setBun, addIngredientWithUuid, removeIngredient, moveIngredient } from '../../services/constructor/constructorSlice';
import { createOrder } from '../../services/order/orderSlice';

const DraggableConstructorElement = ({ item, index, handleRemove }) => {
  const dispatch = useDispatch();
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'constructorElement',
    item: () => ({ index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'constructorElement',
    hover: (draggedItem, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      dispatch(moveIngredient({
        dragIndex,
        hoverIndex
      }));

      draggedItem.index = hoverIndex;
    }
  });

  drag(drop(ref));

  return (
    <div
      className={styles.ingredient}
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className={styles.dragIcon}>
        <DragIcon type="primary" />
      </div>
      <ConstructorElement
        text={item.name}
        price={item.price}
        thumbnail={item.image}
        handleClose={() => handleRemove(item.uuid)}
      />
    </div>
  );
};

export const BurgerConstructor = () => {
  const dispatch = useDispatch();
  const bun = useSelector(selectBun);
  const fillings = useSelector(selectIngredients);
  const totalPrice = useSelector(selectTotalPrice);

  const [{ isHover }, dropTargetRef] = useDrop({
    accept: 'ingredient',
    drop: (item) => {
      if (item.type === 'bun') {
        dispatch(setBun(item));
      } else {
        dispatch(addIngredientWithUuid(item));
      }
    },
    collect: (monitor) => ({
      isHover: monitor.isOver()
    })
  });

  const handleRemoveIngredient = useCallback((uuid) => {
    dispatch(removeIngredient(uuid));
  }, [dispatch]);

  const handleOrderClick = useCallback(() => {
    if (!bun) return;

    const ingredientIds = [
      bun._id,
      ...fillings.map(item => item._id),
      bun._id
    ];

    dispatch(createOrder(ingredientIds));
  }, [dispatch, bun, fillings]);

  const containerStyle = {
    border: isHover ? '1px dashed #4C4CFF' : 'none',
    borderRadius: '8px',
    padding: isHover ? '16px' : '16px 0',
    transition: 'all 0.2s ease'
  };

  const isOrderEnabled = bun && fillings.length > 0;

  return (
    <section className={styles.section}>
      <div
        className={styles.constructorElements}
        ref={dropTargetRef}
        style={containerStyle}
      >
        {bun ? (
          <div className={styles.bun}>
            <ConstructorElement
              type="top"
              isLocked={true}
              text={`${bun.name} (верх)`}
              price={bun.price}
              thumbnail={bun.image}
            />
          </div>
        ) : (
          <div className={`${styles.bun} ${styles.placeholder}`}>
            <p className="text text_type_main-default text_color_inactive">
              Перетащите булку сюда
            </p>
          </div>
        )}

        {fillings.length > 0 ? (
          <div className={styles.scrollArea}>
            {fillings.map((item, index) => (
              <DraggableConstructorElement
                key={item.uuid}
                item={item}
                index={index}
                handleRemove={handleRemoveIngredient}
              />
            ))}
          </div>
        ) : (
          <div className={`${styles.scrollArea} ${styles.placeholder}`}>
            <p className="text text_type_main-default text_color_inactive">
              Перетащите начинки сюда
            </p>
          </div>
        )}

        {bun ? (
          <div className={`${styles.bun} ${styles.bunBottom}`}>
            <ConstructorElement
              type="bottom"
              isLocked={true}
              text={`${bun.name} (низ)`}
              price={bun.price}
              thumbnail={bun.image}
            />
          </div>
        ) : (
          <div className={`${styles.bun} ${styles.bunBottom} ${styles.placeholder}`}>
            <p className="text text_type_main-default text_color_inactive">
              Перетащите булку сюда
            </p>
          </div>
        )}
      </div>

      <div className={styles.total}>
        <div className={styles.price}>
          <span className="text text_type_digits-medium">{totalPrice}</span>
          <CurrencyIcon type="primary" />
        </div>
        <Button
          htmlType="button"
          type="primary"
          size="large"
          onClick={handleOrderClick}
          disabled={!isOrderEnabled}
        >
          Оформить заказ
        </Button>
      </div>
    </section>
  );
};

export default BurgerConstructor;