import mongoose from 'mongoose';

const HelperSchema = new mongoose.Schema({
    eCode: {
        type: Number,
        required: true
    },
    profilePic: {
        data: {
            type: Buffer
        },
        contentType: {
            type: String
        }
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
    },
    email: {
        type: String
    },
    languages: {
        type: [String],
    },
    serviceType: {
        type: String,
        required: [true, 'The role is required'],
    },
    orgName: {
        type: String,
        enum: ['ASBL', 'Springers Helpers'],
        required: [true, 'The Organisation name is required'],
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
        data: {
            type: Buffer,
        },
        contentType: {
            type: String,
        }
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
export default mongoose.model('Helper', HelperSchema)