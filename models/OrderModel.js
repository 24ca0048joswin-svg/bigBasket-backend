const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNo:{
        type:String,
        unique: true,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required:true,
    },
    shippingOrBillingAddress: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        mobileNo: { type: String, required: true },
        streetAddress: { type: String, required: true },
        townCity: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        zipcode: { type: String, required: true }
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: Boolean,
        required: true,
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
});

const OrderModel = mongoose.model("order", orderSchema);
module.exports = OrderModel;