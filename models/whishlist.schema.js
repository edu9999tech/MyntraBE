const mongoose = require("mongoose");

const WishlistItemSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },

},
    { timestamps: true }// adds createdAt & updatedAt
);

// prevent duplicates (user cannot wishlist same product twice)
WishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("WishlistItem", WishlistItemSchema);
