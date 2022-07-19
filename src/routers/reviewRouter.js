const express = require('express');
const { setTourUserIds } = require('../controllers/reviewController')

const {
  getAllReview,
  createReview,
} = require('../controllers/reviewController');
const { protectRouter } = require('../middlewares/authorizeTokenMiddle');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReview)
  .post(protectRouter, setTourUserIds, createReview);

module.exports = router;
