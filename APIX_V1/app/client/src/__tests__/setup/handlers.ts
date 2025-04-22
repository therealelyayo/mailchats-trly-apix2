import { http, HttpResponse } from 'msw';
import type { User } from '@shared/schema';

// Mock user data
const mockUser: User = {
  id: 1,
  username: 'testuser',
  password: 'hashed_password',
  createdAt: new Date(),
  updatedAt: new Date()
};

// HTTP request handlers for mocking API responses
export const handlers = [
  // Mock user login
  http.post('/api/login', () => {
    return HttpResponse.json(mockUser, { status: 200 });
  }),
  
  // Mock user registration
  http.post('/api/register', () => {
    return HttpResponse.json(mockUser, { status: 201 });
  }),
  
  // Mock current user fetch
  http.get('/api/user', () => {
    return HttpResponse.json(mockUser, { status: 200 });
  }),
  
  // Mock logout
  http.post('/api/logout', () => {
    return new HttpResponse(null, { status: 200 });
  }),
  
  // Mock campaigns fetch
  http.get('/api/campaigns', () => {
    return HttpResponse.json([], { status: 200 });
  }),
];