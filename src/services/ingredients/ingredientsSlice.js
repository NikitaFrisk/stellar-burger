import { createSlice, createSelector } from '@reduxjs/toolkit';
import { BASE_URL, ENDPOINTS, checkResponse } from '../../utils/api-constants';

const initialState = {
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
    getIngredientsSuccess: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    },
    getIngredientsError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  },
});

export const {
  getIngredientsRequest,
  getIngredientsSuccess,
  getIngredientsError
} = ingredientsSlice.actions;

export const ingredientsReducer = ingredientsSlice.reducer;

const getItems = state => state.ingredients?.items || [];
const getLoading = state => state.ingredients?.loading || false;
const getError = state => state.ingredients?.error || null;

export const selectIngredients = createSelector(
  [getItems],
  items => [...items]
);

export const selectIngredientsLoading = createSelector(
  [getLoading],
  loading => Boolean(loading)
);

export const selectIngredientsError = createSelector(
  [getError],
  error => error
);

export const fetchIngredients = () => {
  return async (dispatch) => {
    dispatch(getIngredientsRequest());
    try {
      const response = await fetch(`${BASE_URL}${ENDPOINTS.INGREDIENTS}`);
      const data = await checkResponse(response);
      dispatch(getIngredientsSuccess(data.data));
    } catch (error) {
      dispatch(getIngredientsError(error.message));
    }
  };
};
