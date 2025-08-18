import express from 'express';
import {upload} from '../middlewares/multer.middleware';
import { handleUpload } from '../controllers/upload.controller';
import getHelpers from '../controllers/fetch.controller';
import { deleteHelper } from '../controllers/delete.controller';
import { editHelper } from '../controllers/edit.controller';
import { getKycDocument } from '../controllers/kyc.controller';
import getHelpersInfinite from '../controllers/helperFeed.controller';
const router = express.Router();

router.post('/upload',
    upload.fields([
        {name:'profilePic',maxCount:1},
        {name:'kycDoc',maxCount:1},
    ]),
    handleUpload
)


router.get('/helpers',getHelpersInfinite);

router.get('/getHelpers',getHelpers)
router.delete('/deleteHelper/:id',deleteHelper)
router.put('/updateHelper/:id',upload.fields([{ name: 'profilePic', maxCount: 1 },{ name: 'kycDoc', maxCount: 1 },]),editHelper);
router.get('/helpers/:id/kyc',getKycDocument)


export default router;
