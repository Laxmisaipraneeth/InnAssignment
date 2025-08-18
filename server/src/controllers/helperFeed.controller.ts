import { Request, Response } from 'express';
import Helper from '../models/helper.model';
import { IHelperDocument } from '../models/interfaces';


const getHelpersInfinite = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        console.log(req.query);

        const searchTerm = (req.query.search as string) || '';

        const sortKey = (req.query.sortBy as string) || 'fullName';

        const services = (req.query.services as string)
        const organizations = (req.query.organizations as string)

        const queryCondition: any = {};

        if (searchTerm) {
            const searchRegex = new RegExp(searchTerm, 'i');

            const orConditions: any[] = [
                { fullName: searchRegex },
                { phone: searchRegex }
            ];

            if (!isNaN(parseInt(searchTerm))) {
                const numericSearchTerm = parseInt(searchTerm, 10);
                orConditions.push({ eCode: numericSearchTerm });
            }

            queryCondition.$or = orConditions;
        }
        console.log('before filter logic');

        if(services){
            const serviceArray = services.split(",");
            queryCondition.serviceType = {$in:serviceArray}
        }

        if(organizations){
            const orgArray = organizations.split(",");
            queryCondition.orgName = {$in:orgArray};
        }
        console.log('after filter logic');



        const [helpers, totalCountAfterFilter] = await Promise.all([
            Helper.find(queryCondition, { kycDoc: 0 }).sort({ [sortKey]: 1 }).skip(skip).limit(limit),
            Helper.countDocuments(queryCondition)
        ]);

        const helpersWithBase64 = helpers.map((helper) => {
            const helperObj: any = helper.toObject();

            if (helper.profilePic?.data) {
                helperObj.profilePic = `data:${helper.profilePic.contentType};base64,${helper.profilePic.data.toString('base64')}`;
            } else {
                helperObj.profilePic = null;
            }

            helperObj.kycName = helper.kycDocName;
            return helperObj;
        });

        res.json({
            data: helpersWithBase64,
            total: totalCountAfterFilter,
            page: page,
            totalPages: Math.ceil(totalCountAfterFilter / limit)
        });

    } catch (err) {
        console.error("Error fetching helpers:", err);
        res.status(500).json({ error: 'Failed to fetch helpers', details: err });
    }

}

export default getHelpersInfinite;