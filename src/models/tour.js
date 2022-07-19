const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./user');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is unique'],
      unique: true,
    },
    duration: {
      type: Number,
    },
    maxGroupSize: {
      type: Number,
      min: 1,
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'normal', 'medium', 'difficult'],
        message: 'accept: easy, normal, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    summary: {
      type: String,
    },
    description: {
      type: String,
    },
    imageCover: {
      type: String,
    },
    images: {
      type: [String],
    },
    startDates: {
      type: [Date],
    },
    slug: {
      type: String,
    },
    secret: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: {
        type: String,
      },
      description: {
        type: String,
      },
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: {
          type: String,
        },
        description: {
          type: String,
        },
        day: Number,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
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

tourSchema.index({ startLocation: '2dsphere' });

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

tourSchema.pre('find', function (next) {
  this.find({
    secret: { $ne: true },
  });
  next();
});

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secret: { $ne: true } } });
//   next();
// });

// virtuals popolar
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.index({ price: 1 });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
