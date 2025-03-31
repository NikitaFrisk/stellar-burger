import BurgerIngredients from '../components/burger-ingredients/burger-ingredients';
import BurgerConstructor from '../components/burger-constructor/burger-constructor';
import { AppHeader } from '@components/app-header/app-header';
import { ingredients } from '@utils/data';
import styles from './app.module.scss';

export const App = () => {
    return (
        <div className={styles.app}>
            <AppHeader />
            <main className={styles.main}>
                <div className={styles.container}>
                    <BurgerIngredients ingredients={ingredients} />
                    <BurgerConstructor ingredients={ingredients} />
                </div>
            </main>
        </div>
    );
};