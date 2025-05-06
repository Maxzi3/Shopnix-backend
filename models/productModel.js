const mongoose = require("mongoose");
const slugify = require("slugify");
// const validator = require("validator");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount Price ({VALUE}) should be below the regular price",
      },
      default: 0,
    },
    category: { type: String, required: true, set: (val) => val.toLowerCase() },
    stockNo: { type: Number, required: true, default: 0 },
    imageUrl: {
      type: String,
      required: [true, "A Product must have a cover image"],
    },
    images: [{ type: String }],
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ price: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ price: 1, ratingsAverage: -1 });

// Virtual Populate
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

// DOCUMENT MIDDLEWARE
productSchema.pre("save", async function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

productSchema.pre(/^find/, function (next) {
  this.start = Date.now();
  next();
});

productSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
