const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    FirstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters long"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    LastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    phoneNumber: {
      type: String, // keep as string to preserve leading zeros or country codes
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"],
    },
    Email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    Password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      maxlength: [100, "Password cannot exceed 100 characters"],
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

const User = mongoose.model("User", userSchema);

module.exports = User;
