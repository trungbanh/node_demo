const mongoose = require('mongoose');
const Tour = require('./tour');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review cant empty'],
    },
    createAt: {
      type: Date,
      defaut: Date.now(),
    },
    rating: {
      type: Number,
      max: 5,
      min: 1,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  return stats[0];
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: 1 });

reviewSchema.post(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.pre('save', async function (next) {
  const stat = this.constructor.calcAverageRating(this.tour);

  await Tour.findByIdAndUpdate(this.tour, {
    ratingsQuantity: stat.nRating,
    ratingsAverage: stat.avgRating,
  });

  next();
});

reviewSchema.pre(/^findOneAnd/, async function () {
  const stat = this.r.constructor.calcAverageRating(this.tour);

  await Tour.findByIdAndUpdate(this.tour, {
    ratingsQuantity: stat.nRating,
    ratingsAverage: stat.avgRating,
  });
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
