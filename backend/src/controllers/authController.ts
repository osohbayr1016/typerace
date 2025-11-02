import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../types';
import { env } from '../config/env';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('📝 Signup attempt received');
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    console.log('🔍 Checking for existing user:', email, username);
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      console.log('❌ User already exists');
      res.status(400).json({ 
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken' 
      });
      return;
    }

    console.log('🔐 Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('👤 Creating user');
    const user = await User.create({
      email,
      username,
      password: hashedPassword
    });

    console.log('🎟️ Generating token');
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: env.isProduction,
      maxAge: COOKIE_MAX_AGE,
      sameSite: env.isProduction ? 'none' : 'lax'
    });

    console.log('✅ Signup successful for:', user.username);
    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        exp: user.exp,
        level: user.level,
        equippedCar: user.equippedCar,
        equippedSkin: user.equippedSkin
      }
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Failed to create account' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('🔐 Login attempt received');
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    console.log('🔍 Looking up user:', email);
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found:', email);
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    console.log('🔐 Validating password');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    console.log('✅ Password valid, generating token');
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: env.isProduction,
      maxAge: COOKIE_MAX_AGE,
      sameSite: env.isProduction ? 'none' : 'lax'
    });

    console.log('✅ Login successful for:', user.username);
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        exp: user.exp,
        level: user.level,
        equippedCar: user.equippedCar,
        equippedSkin: user.equippedSkin
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out successfully' });
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        exp: user.exp,
        level: user.level,
        inventory: user.inventory,
        equippedCar: user.equippedCar,
        equippedSkin: user.equippedSkin
      }
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

