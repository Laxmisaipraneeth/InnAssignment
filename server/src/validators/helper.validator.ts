import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';


const jsonStringArray = Joi.string().custom((value, helpers) => {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed) || !parsed.every(item => typeof item === 'string')) {
      throw new Error('Array must only contain strings.');
    }
    return value;
  } catch (error) {
    return helpers.message({ custom: 'Languages must be a valid JSON string array.' });
  }
});


const helperBodySchema = Joi.object({
  fullName: Joi.string().trim().min(2).required(),
  gender: Joi.string().valid('male', 'female', 'other').insensitive().required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  email: Joi.string().email().optional().allow(''),
  languages: jsonStringArray.required(),
  serviceType: Joi.string().required(),
  orgName: Joi.string().valid('ASBL', 'Springers Helpers').required(),
  vehicleType: Joi.string().valid('None', 'Auto', 'Bike', 'Car', 'Cycle').required(),
  vehicleNumber: Joi.string().when('vehicleType', {
    is: Joi.string().invalid('None'),
    then: Joi.string().required(),
    otherwise: Joi.string().optional().allow(''),
  }),
  kycDocName: Joi.string().required(),
});

const helperUpdateBodySchema = Joi.object({
  fullName: Joi.string().trim().min(2).optional(),
  gender: Joi.string().valid('male', 'female', 'other').insensitive().optional(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  email: Joi.string().email().optional().allow(''),
  languages: Joi.alternatives().try(
    jsonStringArray,
    Joi.array().items(Joi.string())
  ).optional(),
  serviceType: Joi.string().optional(),
  orgName: Joi.string().valid('ASBL', 'Springers Helpers').optional(),
  vehicleType: Joi.string().valid('None', 'Auto', 'Bike', 'Car', 'Cycle').optional(),
  vehicleNumber: Joi.string().when('vehicleType', {
    is: Joi.string().invalid('None'),
    then: Joi.string().required(),
    otherwise: Joi.string().optional().allow('')
  }),
  kycDocName: Joi.string().optional(),
})



export const validateHelperCreation = (req: Request, res: Response, next: NextFunction) => {
  const { error } = helperBodySchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({ error: `Validation failed: ${errorMessages}` });
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files?.kycDoc?.[0]) {
    return res.status(400).json({ error: 'Missing required KYC document file.' });
  }
  next();
};

export const validateHelperUpdate = (req: Request, res: Response, next: NextFunction)=>{

  const idSchema = Joi.string().hex().length(24).required();
  const { error: idError } = idSchema.validate(req.params.id);


  if (idError) {
    return res.status(400).json({ error: 'Invalid Helper ID format' })
  }

  const { error: bodyError } = helperUpdateBodySchema.validate(req.body, { abortEarly: false });


  if (bodyError) {
    const errorMessages = bodyError.details.map((detail) => detail.message).join(', ')
    return res.status(400).json({ error: `Validation failed:${errorMessages}` })
  }

  const files = req.files as { [fieldName: string]: Express.Multer.File[] } | undefined;

  if (files?.profilePic?.[0]) {
    const profilePicFile = files.profilePic[0];
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(profilePicFile.mimetype)) {
      return res.status(400).json({ error: 'Invalid profile picture file type. Allowed: JPEG, PNG.' });
    }
  }
  next()
}