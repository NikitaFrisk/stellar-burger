import { lazy } from 'react';

// Lazy-загружаемые страницы для code splitting
export const HomePage = lazy(() => import('./home/home').then(module => ({ default: module.HomePage })));
export const LoginPage = lazy(() => import('./login/login').then(module => ({ default: module.LoginPage })));
export const RegisterPage = lazy(() => import('./register/register').then(module => ({ default: module.RegisterPage })));
export const ForgotPasswordPage = lazy(() => import('./forgot-password/forgot-password').then(module => ({ default: module.ForgotPasswordPage })));
export const ResetPasswordPage = lazy(() => import('./reset-password/reset-password').then(module => ({ default: module.ResetPasswordPage })));
export const ProfilePage = lazy(() => import('./profile/profile').then(module => ({ default: module.ProfilePage })));
export const IngredientPage = lazy(() => import('./ingredient/ingredient').then(module => ({ default: module.IngredientPage })));
export const NotFoundPage = lazy(() => import('./not-found/not-found').then(module => ({ default: module.NotFoundPage })));
