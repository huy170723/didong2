// Lấy IP của máy tính chạy XAMPP
// Dùng ipconfig (Windows) hoặc ifconfig (Mac/Linux) để xem IP
export const LOCAL_IP = '192.168.1.5'; // THAY BẰNG IP CỦA BẠN
export const API_PORT = '80'; // XAMPP mặc định port 80

export const API_BASE_URL = `http://localhost/car_api`;
export const API_URL = API_BASE_URL;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login.php',
  REGISTER: '/auth/register.php',
  LOGOUT: '/auth/logout.php',
  
  // Cars
  CARS: '/cars/get_cars.php',
  CAR_DETAIL: '/cars/get_car.php',
  SEARCH: '/cars/search.php',
  
  // Favorites
  FAVORITES: '/favorites/get_favorites.php',
  ADD_FAVORITE: '/favorites/add_favorite.php',
  REMOVE_FAVORITE: '/favorites/remove_favorite.php',
  
  // Orders
  ORDERS: '/orders/get_orders.php',
  CREATE_ORDER: '/orders/create_order.php',
  
  // Users
  PROFILE: '/users/get_profile.php',
} as const;