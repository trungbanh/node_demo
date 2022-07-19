const express = require('express');
const {
  setUserId,
  filterUpdateData,
  verifyPassword,
  getMe,
  getAllUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const {
  protectRouter,
  retrickTo,
} = require('../middlewares/authorizeTokenMiddle');

const router = express.Router();

router.use(protectRouter);

router
  .route('/me')
  .get(setUserId, getMe)
  .post(setUserId, verifyPassword, filterUpdateData, updateUser)
  .delete(setUserId, verifyPassword, deleteUser);

router.use(retrickTo('admin'));
router.route('/').get(getAllUser);
router.route('/:id').post(filterUpdateData, updateUser).delete(deleteUser);

module.exports = router;
