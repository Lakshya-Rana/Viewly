import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      default: null,
    },

    maxParticipants: {
      type: Number,
      default: 10,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash room password
roomSchema.pre("save",function () {
  if (!this.isModified("password") || !this.password) {
    return 
  }

  this.password = bcrypt.hash(this.password, 10);
});

// Check room password
roomSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password);
};

const Room = mongoose.model("Room", roomSchema);

export default Room;