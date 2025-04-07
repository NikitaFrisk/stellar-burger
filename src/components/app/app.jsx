import { IngredientDetails } from '../ingredient-details/ingredient-details';
import BurgerIngredients from '../burger-ingredients/burger-ingredients';
import BurgerConstructor from '../burger-constructor/burger-constructor';
import { AppHeader } from '@components/app-header/app-header';
import { OrderDetails } from '../order-details/order-details';
import { useEffect } from 'react';
import { Modal } from '../modal/modal';
import styles from './app.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIngredients } from '../../services/ingredients/ingredientsSlice';
import { clearCurrentIngredient, selectCurrentIngredient } from '../../services/ingredient-details/ingredientDetailsSlice';
import { selectOrder, clearOrder } from '../../services/order/orderSlice';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export const App = () => {
    const dispatch = useDispatch();
    const selectedIngredient = useSelector(selectCurrentIngredient);
    const order = useSelector(selectOrder);

    useEffect(() => {
        dispatch(fetchIngredients());
    }, [dispatch]);

    const handleCloseModal = () => {
        if (selectedIngredient) {
            dispatch(clearCurrentIngredient());
        }
        if (order) {
            dispatch(clearOrder());
        }
    };

    return (
        <div className={styles.app}>
            <AppHeader />
            <main className={styles.main}>
                <DndProvider backend={HTML5Backend}>
                    <div className={styles.container}>
                        <BurgerIngredients />
                        <BurgerConstructor />
                    </div>
                </DndProvider>
            </main>

            {selectedIngredient && (
                <Modal title="Детали ингредиента" onClose={handleCloseModal}>
                    <IngredientDetails ingredient={selectedIngredient} />
                </Modal>
            )}

            {order && (
                <Modal title="" onClose={handleCloseModal}>
                    <OrderDetails orderNumber={order.number} />
                </Modal>
            )}
        </div>
    );
};