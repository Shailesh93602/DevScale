import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

export const mockHttpClient = axios.create();
export const mockAdapter = new MockAdapter(mockHttpClient, {
  delayResponse: 200,
});

// Example mock
mockAdapter.onPost('/auth/login').reply(200, {
  accessToken: 'mock-token',
  refreshToken: 'mock-refresh-token',
  user: { id: '1', email: 'test@example.com', name: 'Test User' },
});
