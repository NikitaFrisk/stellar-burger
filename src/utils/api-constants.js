export const BASE_URL = 'https://norma.nomoreparties.space/api';

export const ENDPOINTS = {
  INGREDIENTS: '/ingredients',
  ORDERS: '/orders',
};

export const checkResponse = async (res) => {
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`);
  }
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error('API response indicates failure');
  }
  
  return data;
};
