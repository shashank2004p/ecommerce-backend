/**
 * Auth service: register, login, get/update profile.
 */
import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

function signToken(id) {
  return jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

function toUserResponse(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function register({ name, email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }
  const user = await User.create({ name, email: email.toLowerCase(), password });
  const token = signToken(user._id);
  return { token, user: toUserResponse(user) };
}

export async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  const match = await user.comparePassword(password);
  if (!match) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  const token = signToken(user._id);
  return { token, user: toUserResponse(user) };
}

export async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return toUserResponse(user);
}

export async function updateProfile(userId, payload) {
  const allowed = ['name'];
  const update = {};
  for (const key of allowed) {
    if (payload[key] !== undefined) update[key] = payload[key];
  }
  const user = await User.findByIdAndUpdate(userId, update, { new: true });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return toUserResponse(user);
}
