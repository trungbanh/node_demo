const AppError = require('../utils/AppError');
const Tour = require('../models/tour');
const catchAsync = require('../utils/catchAsync');

const {
  deleteOne,
  getOne,
  createOne,
  updateOne,
  getList,
} = require('./handlerFactory');

exports.aliasTopCheap = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price';
  next();
};

exports.getAllTours = getList(Tour);
exports.createTour = createOne(Tour);
exports.getTour = getOne(Tour, [
  {
    path: 'guides',
    select: '-__v -passwordChangeAt',
  },
  {
    path: 'reviews',
    select: {
      review: 1,
      rating: 1,
    },
  },
]);
exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);

exports.getTourStats = catchAsync(async (_req, res) => {
  const stat = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.0 },
      },
    },
    {
      $group: {
        _id: '$difficulty',
        count: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stat,
    },
  });
});


// tour-within/:distance/center/:latlng/unit/:unit
exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(new AppError('please input lat, lng', 400));
  }

  // https://www.google.com/maps/place/Los+Angeles,+CA,+USA/@33.828856,-118.3455484,12.19z/data=!4m5!3m4!1s0x80c2c75ddc27da13:0xe22fdf6f254608f4!8m2!3d34.0522342!4d-118.2436849
  const radius = unit === 'mi' ? distance * 3963.2 : distance * 6378.1

  const tour = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng * 1, lat * 1], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    timeRequestAt: res.timeRequest,
    results: tour.length,
    data: {
      tour,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(new AppError('please input lat, lng', 400));
  }

  // https://www.google.com/maps/place/Los+Angeles,+CA,+USA/@33.828856,-118.3455484,12.19z/data=!4m5!3m4!1s0x80c2c75ddc27da13:0xe22fdf6f254608f4!8m2!3d34.0522342!4d-118.2436849
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const tour = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [lng * 1, lat * 1] },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ])

  res.status(200).json({
    status: 'success',
    timeRequestAt: res.timeRequest,
    data: {
      tour,
    },
  });
})
