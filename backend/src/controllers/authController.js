const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const generateToken = require('../utils/generateToken');

class AuthController {
  /**
   * Register a new user account
   */
  static async register(req, res, next) {
    try {
      const { name, email, password, currency, monthly_income } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmailWithPassword(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
          error: 'EmailAlreadyExists',
        });
      }

      // Hash password securely with bcrypt (12 rounds)
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user record
      const newUser = await UserModel.create({
        name,
        email,
        passwordHash,
        currency: currency || '₹',
        monthlyIncome: monthly_income || 0,
      });

      // Generate JWT
      const token = generateToken(newUser.id);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to Teen Expense Tracker.',
        data: {
          user: newUser,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log in an existing user
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Fetch user including password hash
      const user = await UserModel.findByEmailWithPassword(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password combination.',
          error: 'InvalidCredentials',
        });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password combination.',
          error: 'InvalidCredentials',
        });
      }

      // Generate JWT
      const token = generateToken(user.id);

      // Sanitize user object (omit password_hash)
      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthly_income: user.monthly_income,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user: safeUser,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user profile
   */
  static async getMe(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found.',
          error: 'NotFound',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully.',
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update authenticated user profile
   */
  static async updateProfile(req, res, next) {
    try {
      const { name, currency, monthly_income, password } = req.body;
      const updates = {};

      if (name) updates.name = name;
      if (currency) updates.currency = currency;
      if (monthly_income !== undefined) updates.monthly_income = monthly_income;

      if (password) {
        updates.password_hash = await bcrypt.hash(password, 12);
      }

      const updatedUser = await UserModel.update(req.user.id, updates);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
