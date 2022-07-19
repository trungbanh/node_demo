const Review = require('../models/review');

const { createOne, getList } = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  req.body.tour = req.params.tourId;
  req.body.user = req.user.id;
  next();
};

exports.getAllReview = getList(
  Review,
  [
    {
      path: 'user',
      select: 'name photo',
    },
  ],
  {
    paramName: 'tourId',
    foreignField: 'tour',
  }
);

exports.createReview = createOne(Review);
