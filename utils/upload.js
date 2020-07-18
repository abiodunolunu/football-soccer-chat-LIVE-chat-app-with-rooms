import multer from 'multer'
import path from 'path'
const storage = multer.diskStorage({
    destination: 'images',
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

  
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500000,
    }
}).single('dp')

//   app.use(multer({
//     storage: storage,
//     limits: {
//       fileSize: '20'
//     }
//   }).single('dp='))

export default upload