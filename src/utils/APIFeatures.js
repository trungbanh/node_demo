class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryString };

    const excuteFields = ['page', 'sort', 'fields', 'limit'];

    excuteFields.forEach((el) => delete queryObj[el]);

    // Filter
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (matched) => `$${matched}`
    );
    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortVar = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortVar);
    } else {
      this.query = this.query.sort('createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fieldsVar = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldsVar);
    } else {
      this.query = this.query.select('');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page || 1;
    const limit = this.queryString.limit || 5;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
