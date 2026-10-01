import useLocalStorage from './useLocalStorage.js';

export const ORDERS_KEY = 'blushBloomsOrders';
export default function useOrders() {
  return useLocalStorage(ORDERS_KEY, []);
}
