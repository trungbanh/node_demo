const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopCheap,
  getTourStats,
  getTourWithin,
  getDistance,
} = require('../controllers/tourController');

const reviewRouter = require('./reviewRouter');

const {
  protectRouter,
  retrickTo,
} = require('../middlewares/authorizeTokenMiddle');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/').get(getAllTours).post(protectRouter, createTour);
router.route('/top-cheap-tour').get(aliasTopCheap, getAllTours);
router.route('/stat').get(getTourStats);
router
  .route('/:id')
  .get(getTour)
  .put(protectRouter, updateTour)
  .delete(protectRouter, retrickTo('admin', 'lead'), deleteTour);

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(getTourWithin);
router.route('/tour-distance/:latlng/unit/:unit').get(getDistance);

module.exports = router;
