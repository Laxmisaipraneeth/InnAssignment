import { Request, Response } from 'express'
import Helper from '../models/helper.model';

const getHelpers = async (req: Request, res: Response) => {
  try {
    const helpers = await Helper.find({}, { kycDoc: 0 });
    const helpersWithBase64 = helpers.map((helper) => {
      const helperObj: any = helper.toObject();
      if (helper.profilePic?.data) {
        helperObj.profilePic = `data:${helper.profilePic.contentType};base64,${helper.profilePic.data.toString('base64')}`;
      } else {
        helperObj.profilePic = null;
      }
      helperObj.kycDocName = helper.kycDocName;
      return helperObj;
    });
    res.json(helpersWithBase64);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch helpers', details: err });
  }
};
export default getHelpers;

