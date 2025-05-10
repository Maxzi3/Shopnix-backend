const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      size: {
        type: String,
        enum: {
          values: [
            "S",
            "M",
            "L",
            "XL",
            "30",
            "32",
            "34",
            "36",
            "38",
            "40",
            "42",
            "44",
            "45",
            "Small",
            "Medium",
            "Large",
          ],
          message: "Invalid size: {VALUE}",
        },
        trim: true,
      },
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
