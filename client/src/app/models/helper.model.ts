// export interface Helper {
//   createdAt: any;
//   _id?: string;
//   eCode: number;

//   profilePic?: {
//     data?: ArrayBuffer | Uint8Array;
//     contentType?: string;
//   };

//   fullName: string;

//   gender: 'male' | 'female' | 'other' | 'Male' | 'Female' | 'Other';

//   phone?: string;
//   email?: string;

//   languages?: string[];

//   serviceType: string;

//   orgName: 'ASBL' | 'Springers Helpers';

//   vehicleType?: 'None' | 'Auto' | 'Bike' | 'Car' | 'Cycle';
//   vehicleNumber?: string;

//   kycDoc?: {
//     data?: ArrayBuffer | Uint8Array;
//     contentType?: string;
//   };

//   // Add this new optional property for the KYC document file name
//   kycDocName?: string;

//   joinedDate: Date;
// }

// // src/app/models/helper.model.ts

// export interface IHelper {
//   _id: string; // Mongoose documents have an _id field
//   eCode: number;
//   profilePic: string | null; // Your backend converts the Buffer to a base64 string
//   fullName: string;
//   gender: 'male' | 'female' | 'other' | 'Male' | 'Female' | 'Other';
//   phone?: string;
//   email?: string;
//   languages?: string[];
//   serviceType: string;
//   orgName: 'ASBL' | 'Springers Helpers';
//   vehicleType?: 'None' | 'Auto' | 'Bike' | 'Car' | 'Cycle';
//   vehicleNumber?: string;
//   kycDocName?: string;
//   joinedDate: string; // JSON serialization will convert the Date object to a string
// }


// export interface IPaginatedHelpersResponse {
//   data: IHelper[];
//   total: number;
//   page: number;
//   totalPages: number;
// }



// in src/app/models/helper.model.ts

export interface IHelper {
  _id: string;
  eCode: number;
  profilePic: string | null;
  fullName: string;
  gender: 'male' | 'female' | 'other' | 'Male' | 'Female' | 'Other';
  phone?: string;
  email?: string;
  languages?: string[];
  serviceType: string;
  orgName: 'ASBL' | 'Springers Helpers';
  vehicleType?: 'None' | 'Auto' | 'Bike' | 'Car' | 'Cycle';
  vehicleNumber?: string;
  kycDocName?: string;
  joinedDate: string;

  createdAt: string; 
  updatedAt: string; 
}


export interface Helper extends IHelper {
  createdAt: string; 
  updatedAt:string; 
}

export interface IPaginatedHelpersResponse {
  data: IHelper[];
  total: number;
  page: number;
  totalPages: number;
}