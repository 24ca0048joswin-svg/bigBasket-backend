const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    year: {
        type: 'String'
    },
    totalSales: {
        type: Number,
        default: 0
    },
    totalOrder: {
        type: Number,
        default: 0
    },
    gstForGovt: {
        type: Number,
        default: 0
    },
    totalProductSold: {
        type: Number,
        default: 0
    },
    salesByCategories: {
        fruits: { type: Number, default: 0 },
        vegetables : { type: Number, default: 0 },
        ghee: { type: Number, default: 0 },
        nandini: { type: Number, default: 0 },
        tea: { type: Number, default: 0 },
    },
    salesInEveryMonth: {
        year: { type: Date },
        month: {
            January: { type: Number, default: 0 },
            February: { type: Number, default: 0 },
            March: { type: Number, default: 0 },
            April: { type: Number, default: 0 },
            May: { type: Number, default: 0 },
            June: { type: Number, default: 0 },
            July: { type: Number, default: 0 },
            August: { type: Number, default: 0 },
            September: { type: Number, default: 0 },
            October: { type: Number, default: 0 },
            November: { type: Number, default: 0 },
            December: { type: Number, default: 0 },
        }
    }
});

const AnalyticsModel = mongoose.model("analytics", analyticsSchema);
module.exports = AnalyticsModel;