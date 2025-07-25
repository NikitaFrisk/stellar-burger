import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ENDPOINTS, request } from '../../utils/api-constants';
import { IIngredient } from '@utils/types';
import { AppDispatch, RootState } from '../store';

interface IIngredientsState {
	items: IIngredient[];
	loading: boolean;
	error: string | null;
}

const initialState: IIngredientsState = {
	items: [],
	loading: false,
	error: null,
};

export const ingredientsSlice = createSlice({
	name: 'ingredients',
	initialState,
	reducers: {
		getIngredientsRequest: (state) => {
			state.loading = true;
			state.error = null;
		},
		getIngredientsSuccess: (state, action: PayloadAction<IIngredient[]>) => {
			state.items = action.payload;
			state.loading = false;
		},
		getIngredientsError: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},
	},
});

export const {
	getIngredientsRequest,
	getIngredientsSuccess,
	getIngredientsError,
} = ingredientsSlice.actions;

export const ingredientsReducer = ingredientsSlice.reducer;

const getItems = (state: RootState): IIngredient[] => state.ingredients?.items || [];
const getLoading = (state: RootState): boolean => state.ingredients?.loading || false;
const getError = (state: RootState): string | null => state.ingredients?.error || null;

// Селекторы без ненужных трансформаций
export const selectIngredients = (state: RootState) => getItems(state);
export const selectIngredientsLoading = (state: RootState) => getLoading(state);
export const selectIngredientsError = (state: RootState) => getError(state);

export const fetchIngredients = () => {
	return async (dispatch: AppDispatch) => {
		dispatch(getIngredientsRequest());
		try {
			const data = await request(ENDPOINTS.INGREDIENTS);
			dispatch(getIngredientsSuccess(data.data));
		} catch (error: any) {
			dispatch(getIngredientsError(error.message));
		}
	};
}; 