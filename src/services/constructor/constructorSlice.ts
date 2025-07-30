import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { IIngredient, IConstructorIngredient } from '@utils/types';
import { RootState } from '../store';

export interface IConstructorState {
	bun: IIngredient | null;
	ingredients: IConstructorIngredient[];
}

interface IMoveIngredientPayload {
	dragIndex: number;
	hoverIndex: number;
}

const generateUuid = (): string => {
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const initialState: IConstructorState = {
	bun: null,
	ingredients: [],
};

export const addIngredientWithUuid = (ingredient: IIngredient) => {
	return {
		type: 'constructor/addIngredient',
		payload: {
			...ingredient,
			uuid: generateUuid(),
		},
	};
};

function createSafeConstructorReducer() {
	const slice = createSlice({
		name: 'constructor',
		initialState,
		reducers: {
			setBun: (state, action: PayloadAction<IIngredient>) => {
				state.bun = action.payload;
			},

			addIngredient: (state, action: PayloadAction<IConstructorIngredient>) => {
				if (!Array.isArray(state.ingredients)) {
					state.ingredients = [];
				}

				state.ingredients.push(action.payload);
			},

			removeIngredient: (state, action: PayloadAction<string>) => {
				if (Array.isArray(state.ingredients)) {
					state.ingredients = state.ingredients.filter(
						(item) => item.uuid !== action.payload
					);
				}
			},

			moveIngredient: (state, action: PayloadAction<IMoveIngredientPayload>) => {
				if (!Array.isArray(state.ingredients)) return;

				const { dragIndex, hoverIndex } = action.payload;
				const draggedItem = state.ingredients[dragIndex];

				if (draggedItem) {
					const newIngredients = [...state.ingredients];
					newIngredients.splice(dragIndex, 1);
					newIngredients.splice(hoverIndex, 0, draggedItem);
					state.ingredients = newIngredients;
				}
			},

			clearConstructor: (state) => {
				state.bun = null;
				state.ingredients = [];
			},
		},
	});

	return (state: IConstructorState | undefined, action: any) => {
		if (state === undefined) {
			return initialState;
		}

		if (typeof state === 'function') {
			console.log(
				'!!!Encountered function state during Redux processing, returning fresh initial state'
			);
			return { ...initialState };
		}

		if (!state.ingredients) {
			console.log('!!!Incomplete state structure detected, rebuilding state');
			return {
				...initialState,
				...state,
			};
		}

		return slice.reducer(state, action);
	};
}

const constructorSlice = createSlice({
	name: 'constructor',
	initialState,
	reducers: {
		setBun: (state, action: PayloadAction<IIngredient>) => {
			state.bun = action.payload;
		},

		addIngredient: (state, action: PayloadAction<IConstructorIngredient>) => {
			if (!Array.isArray(state.ingredients)) {
				state.ingredients = [];
			}

			state.ingredients.push(action.payload);
		},

		removeIngredient: (state, action: PayloadAction<string>) => {
			if (Array.isArray(state.ingredients)) {
				state.ingredients = state.ingredients.filter(
					(item) => item.uuid !== action.payload
				);
			}
		},

		moveIngredient: (state, action: PayloadAction<IMoveIngredientPayload>) => {
			if (!Array.isArray(state.ingredients)) return;

			const { dragIndex, hoverIndex } = action.payload;
			const draggedItem = state.ingredients[dragIndex];

			if (draggedItem) {
				const newIngredients = [...state.ingredients];
				newIngredients.splice(dragIndex, 1);
				newIngredients.splice(hoverIndex, 0, draggedItem);
				state.ingredients = newIngredients;
			}
		},

		clearConstructor: (state) => {
			state.bun = null;
			state.ingredients = [];
		},
	},
});

export const {
	setBun,
	addIngredient,
	removeIngredient,
	moveIngredient,
	clearConstructor,
} = constructorSlice.actions;

export const constructorReducer = createSafeConstructorReducer();

const getBun = (state: RootState): IIngredient | null => {
	if (!state || !state.constructor || typeof state.constructor === 'function') {
		return null;
	}
	return state.constructor.bun;
};

const getIngredientsList = (state: RootState): IConstructorIngredient[] => {
	if (!state || !state.constructor || typeof state.constructor === 'function') {
		return [];
	}
	return Array.isArray(state.constructor.ingredients)
		? state.constructor.ingredients
		: [];
};

export const selectBun = (state: RootState) => getBun(state);

export const selectIngredients = (state: RootState) => getIngredientsList(state);

export const selectTotalPrice = createSelector(
	[getBun, getIngredientsList],
	(bun, ingredients) => {
		const bunPrice = bun ? bun.price * 2 : 0;
		const ingredientsPrice = Array.isArray(ingredients)
			? ingredients.reduce((sum, item) => sum + (item?.price || 0), 0)
			: 0;

		return bunPrice + ingredientsPrice;
	}
); 