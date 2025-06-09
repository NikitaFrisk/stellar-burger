import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BurgerIngredients from '../../components/burger-ingredients/burger-ingredients';
import BurgerConstructor from '../../components/burger-constructor/burger-constructor';
import styles from './home.module.scss';

export const HomePage = () => {
	return (
		<main className={styles.main}>
			<DndProvider backend={HTML5Backend}>
				<div className={styles.container}>
					<BurgerIngredients />
					<BurgerConstructor />
				</div>
			</DndProvider>
		</main>
	);
};
