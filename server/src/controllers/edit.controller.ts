import { Request, Response } from 'express';
import Helper from '../models/helper.model';

export const editHelper = async (req: Request, res: Response) => {
  try {
    const helperId = req.params.id;
    if (!helperId) {
      return res.status(400).json({ error: 'Missing helper ID' });
    }

    const isMultipart = req.is('multipart/form-data');
    const body = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const updatePayload: any = {};

    const textFields = [
      'fullName', 'gender', 'phone', 'email',
      'serviceType', 'orgName', 'vehicleType', 'vehicleNumber', 'kycDocName'
    ];

    for (const field of textFields) {
      if (body[field] !== undefined && body[field] !== '') {
        updatePayload[field] = body[field];
      }
    }

    if (body.languages !== undefined) {
      if (isMultipart && typeof body.languages === 'string') {
        try {
          const parsedLanguages = JSON.parse(body.languages);
          if (Array.isArray(parsedLanguages)) {
            updatePayload.languages = parsedLanguages;
          } else {
            return res.status(400).json({ error: 'Languages field must be an array' });
          }
        } catch {
          return res.status(400).json({ error: 'Invalid JSON format for languages' });
        }
      } else if (Array.isArray(body.languages)) {
        updatePayload.languages = body.languages;
      }
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

    const h = updatedHelper.toObject();

    const responseHelper = {
      _id: h._id,
      eCode: h.eCode,
      fullName: h.fullName,
      gender: h.gender,
      phone: h.phone,
      email: h.email,
      languages: h.languages,
      serviceType: h.serviceType,
      orgName: h.orgName,
      vehicleType: h.vehicleType,
      vehicleNumber: h.vehicleNumber,
      kycDocName: h.kycDocName,
      profilePicUrl: h.profilePic?.data
        ? `data:${h.profilePic.contentType};base64,${Buffer.from(h.profilePic.data).toString('base64')}`
        : null,
      kycDoc: h.kycDoc || null,

    };

    return res.status(200).json({
      message: 'Helper updated successfully',
      helper: responseHelper,
    });
  } catch (err) {
    console.error('Error updating helper:', err);
    return res.status(500).json({ error: 'Internal server error', details: err });
  }
};
