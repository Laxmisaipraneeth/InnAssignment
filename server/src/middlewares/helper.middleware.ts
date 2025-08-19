import { Request, Response, NextFunction } from 'express';
import Helper from '../models/helper.model';

export const checkDuplicateHelper = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fullName, phone } = req.body;
        const existingHelper = await Helper.findOne({ fullName, phone });

        if (existingHelper) {
            console.log('duplicate checker is working')
            return res.status(409).json({ error: 'A helper with the same name and phone number already exists.' });
        }
        next();
    } catch (err) {
        console.error('Error in checkDuplicateHelper middleware:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};