import express from 'express';
import {upload} from '../middlewares/multer.middleware';
import { handleUpload } from '../controllers/upload.controller';
import getHelpers from '../controllers/fetch.controller';
import { deleteHelper } from '../controllers/delete.controller';
import { editHelper } from '../controllers/edit.controller';
import { getKycDocument } from '../controllers/kyc.controller';
import getHelpersInfinite from '../controllers/helperFeed.controller';
import { validateHelperCreation, validateHelperUpdate } from '../validators/helper.validator';
import { checkDuplicateHelper } from '../middlewares/helper.middleware';
const router = express.Router();

const uploadFields = upload.fields([{ name: 'profilePic', maxCount: 1 },{ name: 'kycDoc', maxCount: 1 }])
router.post('/upload',
    uploadFields,
    validateHelperCreation,
    checkDuplicateHelper,
    handleUpload
)


router.get('/helpers',getHelpersInfinite);

// router.get('/getHelpers',getHelpers)
router.delete('/deleteHelper/:id',deleteHelper)
router.put('/updateHelper/:id',uploadFields,validateHelperUpdate,editHelper);
router.get('/helpers/:id/kyc',getKycDocument)


export default router;
