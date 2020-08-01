import express from 'express';
const router = express.Router();
import indexController from '../controllers/index.js'
import isAuth from '../middleware/isAuth.js';


router.get('/', indexController.getIndex)

// router.post('/chat', indexController.goToChat)

router.get('/chat', isAuth, indexController.getChatPage)
    .get('/rooms', isAuth, indexController.getRooms)
    .post('/room', isAuth, indexController.postRoom)
    .get('/upload-dp', isAuth, indexController.getUploadPage)
    .post('/upload-dp', isAuth, indexController.postUpload)

export default router
