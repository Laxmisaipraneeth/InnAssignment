import { Request, Response } from 'express';
import Helper from '../models/helper.model';
import generateUniqueECode from '../services/employeeCode.generator';

export const handleUpload = async (req: Request, res: Response) => {
  try {
    console.log('BODY:', req.body);
    console.log('FILES:', req.files);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const profilePicFile = files['profilePic']?.[0];
    const kycDocFile = files['kycDoc']?.[0];

    const {
      fullName,
      gender,
      phone,
      languages,
      email,
      serviceType,
      orgName,
      vehicleType,
      vehicleNumber,
      kycDocName
    } = req.body;

    const uniqueECode = await generateUniqueECode();

    

    const helperData: any = {
      eCode: uniqueECode,
      fullName,
      gender,
      phone,
      email,
      languages: JSON.parse(languages),
      serviceType,
      orgName,
      vehicleType,
      vehicleNumber,
      kycDoc: {
        data: kycDocFile.buffer,
        contentType: kycDocFile.mimetype,
      },
      kycDocName,
      joinedDate: new Date()
    };

    if (profilePicFile) {
      helperData.profilePic = {
        data: profilePicFile.buffer,
        contentType: profilePicFile.mimetype,
      };
    }

    const helper = new Helper(helperData);
    await helper.save();

    return res.status(201).json({ message: 'Helper registered successfully', helper });
  } catch (err) {
    console.error('Error in handleUpload:', err);
    return res.status(500).json({ error: 'Internal server error', details: err });
  }
};
