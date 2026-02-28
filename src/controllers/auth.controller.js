/**
 * Auth controller: register, login, getProfile, updateProfile.
 * Responses follow { success, message, data }.
 */
import * as authService from '../services/auth.service.js';
import { success, error } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  return success(res, data, 'Registration successful', 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  return success(res, data, 'Login successful');
});

export const getProfile = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.user.id);
  return success(res, data, 'Profile retrieved');
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = await authService.updateProfile(req.user.id, req.body);
  return success(res, data, 'Profile updated');
});
