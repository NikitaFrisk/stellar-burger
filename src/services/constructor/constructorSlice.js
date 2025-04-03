import { createSlice, createSelector } from '@reduxjs/toolkit';

const generateUuid = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const initialState = {
  bun: null,
  ingredients: []
};

export const addIngredientWithUuid = (ingredient) => {
  return {
    type: 'constructor/addIngredient',
    payload: {
      ...ingredient,
      uuid: generateUuid()
    }
  };
};

function createSafeConstructorReducer() {
  const slice = createSlice({
    name: 'constructor',
    initialState,
    reducers: {
      setBun: (state, action) => {
        state.bun = action.payload;
      },

      addIngredient: (state, action) => {
        if (!Array.isArray(state.ingredients)) {
          state.ingredients = [];
        }

        state.ingredients.push(action.payload);
      },

      removeIngredient: (state, action) => {
        if (Array.isArray(state.ingredients)) {
          state.ingredients = state.ingredients.filter(item =>
            item.uuid !== action.payload
          );
        }
      },

      moveIngredient: (state, action) => {
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
      }
    }
  });

  return (state, action) => {
    if (state === undefined) {
      return initialState;
    }

    if (typeof state === 'function') {
      console.log('!!!Encountered function state during Redux processing, returning fresh initial state');
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
    setBun: (state, action) => {
      state.bun = action.payload;
    },

    addIngredient: (state, action) => {
      if (!Array.isArray(state.ingredients)) {
        state.ingredients = [];
      }

      state.ingredients.push(action.payload);
    },

    removeIngredient: (state, action) => {
      if (Array.isArray(state.ingredients)) {
        state.ingredients = state.ingredients.filter(item =>
          item.uuid !== action.payload
        );
      }
    },

    moveIngredient: (state, action) => {
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
    }
  }
});

export const {
  setBun,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} = constructorSlice.actions;

export const constructorReducer = createSafeConstructorReducer();

const getBun = state => {
  if (!state || !state.constructor || typeof state.constructor === 'function') {
    return null;
  }
  return state.constructor.bun;
};

const getIngredientsList = state => {
  if (!state || !state.constructor || typeof state.constructor === 'function') {
    return [];
  }
  return Array.isArray(state.constructor.ingredients) ? state.constructor.ingredients : [];
};

export const selectBun = createSelector(
  [getBun],
  bun => bun ? { ...bun } : null
);

export const selectIngredients = createSelector(
  [getIngredientsList],
  ingredients => ingredients.slice()
);

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
