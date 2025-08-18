import { Request, Response } from 'express';
import Helper from '../models/helper.model';

export const editHelper = async (req: Request, res: Response) => {
  try {
    const helperId = req.params.id;
    const body = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const updatePayload: any = { ...body };
    if (typeof body.languages === 'string') {
      updatePayload.languages = JSON.parse(body.languages);
    }


    if (files?.profilePic?.[0]) {
      updatePayload.profilePic = {
        data: files.profilePic[0].buffer,
        contentType: files.profilePic[0].mimetype,
      };
    }

    if (files?.kycDoc?.[0]) {
      updatePayload.kycDoc = {
        data: files.kycDoc[0].buffer,
        contentType: files.kycDoc[0].mimetype,
      };
    }

    const updatedHelper = await Helper.findByIdAndUpdate(
      helperId,
      { $set: updatePayload },
      { new: true, runValidators: true } 
    );

    if (!updatedHelper) {
      return res.status(404).json({ error: 'Helper not found' });
    }

    return res.status(200).json({
      message: 'Helper updated successfully',
      helper: updatedHelper,
    });

  } catch (err) {
    console.error('Error updating helper:', err);
    return res.status(500).json({ error: 'Internal server error', details: err });
  }
};