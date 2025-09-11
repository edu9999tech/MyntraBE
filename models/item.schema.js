const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: 100,
    },
    sku: { // ItemID
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Electronics", "Fashion", "Sportswear","Home & Kitchen","Mens","Womens","Other"],
      default: "Other",
    },
    brand: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    images: [
      {
        url: { type: String },
        alt: { type: String },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
