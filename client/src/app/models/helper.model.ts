
export interface IHelper {
  _id?: string;
  eCode?: number;
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
  joinedDate?: string;

  createdAt?: string; 
  updatedAt?: string; 
}


export interface Helper extends IHelper {
  isPreview?:boolean;

}

export interface IPaginatedHelpersResponse {
  data: IHelper[];
  total: number;
  page: number;
  totalPages: number;
}