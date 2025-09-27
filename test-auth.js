import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const BASE_URL = 'http://localhost:5000/api';

async function testAuthentication() {
  console.log('🧪 Testing Authentication System...\n');

  // Create a cookie jar and wrap axios
  const jar = new CookieJar();
  const client = wrapper(axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    jar
  }));

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await client.get('/health');
    console.log('✅ Server is running:', healthResponse.data);
    console.log('');

    // Test 2: Try to login with default admin credentials
    console.log('2. Testing admin login...');
    const loginResponse = await client.post('/admin/login', {
      username: 'admin',
      password: 'admin123',
      loginType: 'admin'
    });
    console.log('✅ Admin login successful:', loginResponse.data);
    console.log('');

    // Test 3: Check authentication status
    console.log('3. Testing authentication check...');
    const authResponse = await client.get('/admin/check-auth');
    console.log('✅ Authentication check successful:', authResponse.data);
    console.log('');

    // Test 4: Test protected route access
    console.log('4. Testing protected route access...');
    const playersResponse = await client.get('/players');
    console.log('✅ Protected route access successful');
    console.log('');

    // Test 5: Test logout
    console.log('5. Testing logout...');
    const logoutResponse = await client.post('/admin/logout');
    console.log('✅ Logout successful:', logoutResponse.data);
    console.log('');

    // Test 6: Verify logout worked
    console.log('6. Verifying logout...');
    try {
      await client.get('/admin/check-auth');
      console.log('❌ Logout verification failed - still authenticated');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Logout verification successful - no longer authenticated');
      } else {
        console.log('❌ Unexpected error during logout verification:', error.message);
      }
    }

    console.log('\n🎉 All authentication tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
await testAuthentication(); 