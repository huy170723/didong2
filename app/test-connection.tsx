import api from '@/services/api';

export async function testAPIConnection() {
  try {
    console.log('Testing API connection...');
    const response = await api.get('/cars/get_cars.php', {
      params: { limit: 3 }
    });
    console.log('✅ API Connection SUCCESS:', response.data);
    return true;
  } catch (error: any) {
    console.log('❌ API Connection FAILED:', error.message);
    console.log('Error details:', error);
    return false;
  }
}