import mongoose from 'mongoose';

const HelperSchema = new mongoose.Schema({
    eCode: {
        type: Number,
        required: true,
        unique: true 
    },
    profilePic: {
        data: Buffer,
        contentType: String
    },
    fullName: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'Male', 'Female', 'Other'],
        required: [true, 'The gender is required'],
    },
    phone: {
        type: String,
        unique: true, 
    },
    email: {
        type: String,
        unique: true, 
        sparse: true 
    },
    languages: {
        type: [String],
    },
    serviceType: {
        type: String,
        required: [true, 'The role is required'],
        index: true 
    },
    orgName: {
        type: String,
        enum: ['ASBL', 'Springers Helpers'],
        required: [true, 'The Organisation name is required'],
        index: true 
    },
    vehicleType: {
        type: String,
        enum: ['None', 'Auto', 'Bike', 'Car', 'Cycle'],
        default: 'None',
    },
    vehicleNumber: {
        type: String,
    },
    kycDoc: {
        data: Buffer,
        contentType: String
    },
    kycDocName: {
        type: String,
        required: false 
    },
    joinedDate: {
        type: Date,
        required: true,
    }
});

HelperSchema.index({ orgName: 1, serviceType: 1 });
HelperSchema.index({fullName:1,phone:1},{unique:true});

export default mongoose.model('Helper', HelperSchema);