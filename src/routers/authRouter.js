const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');
const { protectRouter } = require('../middlewares/authorizeTokenMiddle');

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').patch(resetPassword);

router.route('/update-password').post(protectRouter, updatePassword);

module.exports = router;
