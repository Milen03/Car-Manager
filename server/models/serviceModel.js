const mongoose = require('mongoose');
const serviceSchema = new mongoose.Schema({
    car:{
        type: mongoose.Types.ObjectId,
        ref: "Car",
        required: true
    },
    type:{
        type: String,
        required: true,
        enum: ['Oil', 'Air Filter', 'Tires', 'Vignette','Brake-Pads', 'other']
    },
    mileagesAtService:{
        type: Number,
        required: true
    },
    changeEveryKm:{
        type: Number,
        required: true
    },
    notes:{
        type: String
    }
}, {timestamps: true});

module.exports = mongoose.model('Service', serviceSchema);