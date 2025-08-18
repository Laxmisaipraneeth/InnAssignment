import mongoose from 'mongoose';

interface IBinaryData {
    data: Buffer;
    contentType: string;
}


export interface IHelperDocument extends mongoose.Document {
    eCode: number;
    profilePic?: IBinaryData;
    fullName: string;
    gender: 'male' | 'female' | 'other' | 'Male' | 'Female' | 'Other';
    phone?: string;
    email?: string;
    languages?: string[];
    serviceType: string;
    orgName: 'ASBL' | 'Springers Helpers';
    vehicleType?: 'None' | 'Auto' | 'Bike' | 'Car' | 'Cycle';
    vehicleNumber?: string;
    kycDoc?: IBinaryData;
    kycDocName?: string;
    joinedDate: Date;
}