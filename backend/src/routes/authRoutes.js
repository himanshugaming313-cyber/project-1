const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
} = require('../validators/authValidator');

// Public routes
router.post('/register', registerValidator, validate, AuthController.register);
router.post('/login', loginValidator, validate, AuthController.login);

// Protected routes
router.get('/me', protect, AuthController.getMe);
router.put('/me', protect, updateProfileValidator, validate, AuthController.updateProfile);

module.exports = router;
