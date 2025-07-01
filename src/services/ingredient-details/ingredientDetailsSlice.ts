import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IIngredient } from '@utils/types';
import { RootState } from '../store';

interface IIngredientDetailsState {
	currentIngredient: IIngredient | null;
}

const initialState: IIngredientDetailsState = {
	currentIngredient: null,
};

export const ingredientDetailsSlice = createSlice({
	name: 'ingredientDetails',
	initialState,
	reducers: {
		setCurrentIngredient: (state, action: PayloadAction<IIngredient>) => {
			state.currentIngredient = action.payload;
		},
		clearCurrentIngredient: (state) => {
			state.currentIngredient = null;
		},
	},
});

export const { setCurrentIngredient, clearCurrentIngredient } =
	ingredientDetailsSlice.actions;
export const ingredientDetailsReducer = ingredientDetailsSlice.reducer;

export const selectCurrentIngredient = (state: RootState): IIngredient | null =>
	state.ingredientDetails ? state.ingredientDetails.currentIngredient : null; 