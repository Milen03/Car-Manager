const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const carSchema = new mongoose.Schema({
brand: {
    type: String,
    required: true  
},
model: {
    type: String,
    required: true  
},year: {
    type: Number,
    required: true          
},
registrationNumber: {
    type: String,
    required: true
},
mileage: {
    type: Number,
    required: true
},
userId: {
    type: ObjectId,
    ref: "User"
},
}, { timestamps: { createdAt: 'created_at' }    
});

module.exports = mongoose.model('Car', carSchema);