const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'it required valid email',
    },
  },
  role: {
    type: String,
    enum: ['admin', 'lead-guide', 'user', 'guide'],
  },
  password: {
    type: String,
    require: true,
    select: false,
  },
  passwordConfirmation: {
    type: String,
    require: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'password not same',
    },
  },
  photo: {
    type: String,
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordTokenExpiration: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.methods.checkCorrectPassword = async function (
  rawPassword,
  hashedPassword
) {
  return await bcrypt.compare(rawPassword, hashedPassword);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirmation = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') && this.isNew) {
    next();
  }

  this.passwordChangeAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(23).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this.passwordTokenExpiration = Date.now() + 10 * 60 * 1000;

  return token;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
