import axios from 'axios';

const localurl = `http://localhost:5000`
const cloudurl = `https://dreaminalgo-backend-production.up.railway.app`
const domainurl = `https://algoapi.dreamintraders.in`

const api = axios.create({
   baseURL: `${localurl}`,
    withCredentials: true, // 🍪 cookies  auto sent 
    headers: { 
      'Content-Type': 'application/json',
     },
   });

/* =========================== 
   REFRESH ACCESS TOKEN 
=========================== */

const refreshAccessToken = async () => {
  try { 
    await api.post('/api/adminauth/refresh');
    return true;
  } catch (err) {
    return false;
  }
};

/* ===========================
   GENERIC API REQUEST
=========================== */

export const apiRequest = async (
  method,
  endpoint,
  data,
  retry = true // ⛔ retry only once
) => {
  try {
    const response = await api({
      method,
      url: endpoint,
      ...(data !== undefined && { data }),
    });

    return response.data; 
  } catch (error) {
    // 🔐 Access token expired
    if (
      error.response?.status === 401 &&
      retry
    ) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        // 🔁 retry original request ONCE
        return apiRequest(method, endpoint, data, false);
      }

      // ❌ refresh failed → logout
      window.location.href = '/auth/login';
      throw new Error('Session expired');
    }

    throw new Error(
      error || 'Something went wrong'
    );
  }
};

export default api;
 