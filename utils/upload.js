import multer from 'multer'
import path from 'path'
import DatauriParser from 'datauri/parser.js'
import cloudinary from 'cloudinary'
const uploader = cloudinary.v2.uploader
const config = cloudinary.v2.config
const parser = new DatauriParser()

const dataUri = req => {
    return parser.format(
        path.extname(req.file.originalname).toString(),
        req.file.buffer
    )
}

const cloudinaryConfig = (req, res, next) => {
    config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_Secret,
        use_filename: true
    })
    next()
}



const storage = multer.memoryStorage({
    filename: (req, file, cb) => {
      const time = Date.now()
      cb(null, file.fieldname + '-' + time + path.extname(file.originalname))
    }
  })

  const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb({code: 'Error: Images Only!'})
    }
};

  
const MulterUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500000,
    }
}).single('dp')



export  {
    dataUri,
    MulterUpload,
    cloudinaryConfig,
    uploader
}