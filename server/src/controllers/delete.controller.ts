import { Request, Response } from 'express'
import Helper from '../models/helper.model';

export const deleteHelper = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const [deletedDocument,documentCount] = await Promise.all([
            Helper.findByIdAndDelete(id),
            Helper.countDocuments()
        ])
        if (!deletedDocument) {
            return res.status(404).json({ error: 'Helper not found' });
        }

        res.status(200).json(deletedDocument);
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete helper', details: err });
    }
}

export default fetch;
