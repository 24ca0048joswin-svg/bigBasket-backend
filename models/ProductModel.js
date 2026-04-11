const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
   productUrl:{
    type:String,
    required:true,
   },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  isHarDinSasta:{
    type: Boolean,
    required: true,
  },
  discountPercentage:{
    type:Number,
    required:true,
  },
  category:{
    type:String,
    required:true,
  }
});

const ProductModel = mongoose.model("product", productSchema);
module.exports = ProductModel;