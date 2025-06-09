import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BASE_URL, checkResponse } from '../../utils/api-constants';
import { getCookie, setCookie, deleteCookie } from '../../utils/cookie';

// Типы для пользователя и состояния
interface User {
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isPasswordResetRequested: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

interface ResetPasswordData {
  password: string;
  token: string;
}

interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isPasswordResetRequested: false
};

// Async thunks
export const register = createAsyncThunk<AuthResponse, RegisterData>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await checkResponse(response);
      
      // Сохраняем токены
      setCookie('refreshToken', data.refreshToken);
      localStorage.setItem('accessToken', data.accessToken);
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk<AuthResponse, LoginData>(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await checkResponse(response);
      
      // Сохраняем токены
      setCookie('refreshToken', data.refreshToken);
      localStorage.setItem('accessToken', data.accessToken);
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk<void, void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = getCookie('refreshToken');
      
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: refreshToken })
      });

      await checkResponse(response);
      
      // Удаляем токены
      deleteCookie('refreshToken');
      localStorage.removeItem('accessToken');
      
      return;
    } catch (error: any) {
      // Даже если запрос не удался, локально выходим
      deleteCookie('refreshToken');
      localStorage.removeItem('accessToken');
      return rejectWithValue(error.message);
    }
  }
);

export const refreshToken = createAsyncThunk<{ accessToken: string; refreshToken: string }, void>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshTokenValue = getCookie('refreshToken');
      
      const response = await fetch(`${BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: refreshTokenValue })
      });

      const data = await checkResponse(response);
      
      // Обновляем токены
      setCookie('refreshToken', data.refreshToken);
      localStorage.setItem('accessToken', data.accessToken);
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUser = createAsyncThunk<{ user: User }, void>(
  'auth/getUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      let accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(`${BASE_URL}/auth/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken || ''
        }
      });

      if (response.status === 401) {
        // Токен истек, обновляем
        const refreshResult = await dispatch(refreshToken());
        if (refreshResult.type === 'auth/refreshToken/fulfilled') {
          accessToken = (refreshResult.payload as any).accessToken;
          
          const retryResponse = await fetch(`${BASE_URL}/auth/user`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': accessToken || ''
            }
          });
          
          const data = await checkResponse(retryResponse);
          return data;
        } else {
          throw new Error('Token refresh failed');
        }
      } else {
        const data = await checkResponse(response);
        return data;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk<{ user: User }, UpdateUserData>(
  'auth/updateUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      let accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(`${BASE_URL}/auth/user`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken || ''
        },
        body: JSON.stringify(userData)
      });

      if (response.status === 401) {
        // Токен истек, обновляем
        const refreshResult = await dispatch(refreshToken());
        if (refreshResult.type === 'auth/refreshToken/fulfilled') {
          accessToken = (refreshResult.payload as any).accessToken;
          
          const retryResponse = await fetch(`${BASE_URL}/auth/user`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': accessToken || ''
            },
            body: JSON.stringify(userData)
          });
          
          const data = await checkResponse(retryResponse);
          return data;
        } else {
          throw new Error('Token refresh failed');
        }
      } else {
        const data = await checkResponse(response);
        return data;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestPasswordReset = createAsyncThunk<{ success: boolean }, string>(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await checkResponse(response);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk<{ success: boolean }, ResetPasswordData>(
  'auth/resetPassword',
  async ({ password, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/password-reset/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, token })
      });

      const data = await checkResponse(response);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.isPasswordResetRequested = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.isPasswordResetRequested = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Даже при ошибке выходим локально
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.isPasswordResetRequested = false;
      })
      // Get user
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Request password reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.isPasswordResetRequested = true;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.isPasswordResetRequested = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Refresh token
      .addCase(refreshToken.rejected, (state) => {
        // Если обновление токена не удалось - выходим полностью
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.isPasswordResetRequested = false;
        
        // Очищаем токены из хранилища
        deleteCookie('refreshToken');
        localStorage.removeItem('accessToken');
      });
  }
});

export const { clearError, logout } = authSlice.actions;

export const authReducer = authSlice.reducer;

// Selectors с типизацией
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsPasswordResetRequested = (state: { auth: AuthState }) => state.auth.isPasswordResetRequested; 