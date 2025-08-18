import { Request, Response } from 'express';
import Helper from '../models/helper.model';

export const getKycDocument = async (req: Request, res: Response) => {
  try {
    const helperId = req.params.id;

    const helper = await Helper.findById(helperId,{kycDoc:1,_id:0})

    if (!helper || !helper.kycDoc || !helper.kycDoc.data || !helper.kycDoc.contentType) {
      return res.status(404).json({ error: 'KYC document not found.' });
    }

    res.setHeader('Content-Type', helper.kycDoc.contentType);

    res.send(helper.kycDoc.data);

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch KYC document', details: err });
  }
};