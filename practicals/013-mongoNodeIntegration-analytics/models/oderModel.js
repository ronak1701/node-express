const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
   id: {
    type: Number,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  items: {
    type: Array,
    required: true,
  },
});

const Order = mongoose.model("order",orderSchema)

module.exports = Order