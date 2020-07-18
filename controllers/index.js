import User from '../models/User.js';
import Room from '../models/Room.js';
import moment from 'moment';
import upload from '../utils/upload.js'

const getIndex = async (req, res, next) => {
  res.render('main/index', {
    path: '/',
    pageTitle: 'Welcome to SoccerChat',
  })
}

const getChatPage = async (req, res, next) => {
  if (!req.session.room) {
    req.flash('error', 'You need to select a room')
    res.redirect('/rooms')
  }
  try {
    const user = await User.findById(req.session.user._id, '-password')
    console.log(user)
    const room = await Room.findOne({ name: req.session.room }).populate('messages.sender').select('messages name')
    const messages = room.messages.map(msg => {
      return {
        text: msg.text,
        authorId: msg.sender._id,
        author: msg.sender.fullname,
        authorPicture: msg.sender.displayPicture,
        time: `${moment(msg.createdAt).fromNow()} - ${moment(msg.createdAt).format('lll')}`
      }
    })
    res.render('main/chat', {
      pageTitle: 'ENJOY',
      path: '/chat',
      username: user.fullname,
      userId: user._id,
      userPicture: user.displayPicture,
      room: room.name,
      roomMessages: messages
    })
  } catch (err) {
    console.log(err)
    const error = new Error(err)
    err.statusCode = 500
    return next(error)
  }

}

const getRooms = async (req, res, next) => {
  res.render('main/rooms', {
    path: '/rooms',
    pageTitle: 'choose a room to enter'
  })
}

const postRoom = async (req, res, next) => {
  const { room } = req.body
  if (!room) {
    return res.redirect('/rooms')
  }
  req.session.room = room
  req.session.save((err) => {
    res.redirect('/chat')
  })
}

const getUploadPage = async (req, res, next) => {
  res.render('main/add-profile-picture', {
    path: '/upload',
    pageTitle: 'Upload avatar',
    validationErrors: []

  })
}

const postUpload = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code == "LIMIT_FILE_SIZE") {
        return res.render('main/add-profile-picture', {
          path: '/upload',
          pageTitle: 'Upload avatar',
          validationErrors: ['Image too large. Maximum size 500kb!']
        })
      } else {
        return res.render('main/add-profile-picture', {
          path: '/upload',
          pageTitle: 'Upload avatar',
          validationErrors: [err.code]
        })
      }
    } else if (req.file == undefined) {
      return res.render('main/add-profile-picture', {
        path: '/upload',
        pageTitle: 'Upload avatar',
        validationErrors: ['No Image Selected']
      })
    } else {
      const user = await User.findByIdAndUpdate(req.session.user._id);
      user.displayPicture = req.file.path
      await user.save()
      return res.render('main/add-profile-picture', {
        path: '/upload',
        pageTitle: 'Upload avatar',
        validationErrors: [],
        success: ['Image Uploaded']
      })
    }
  })
}
// console.log(res, 'resssssssssssssssss')
// res.redirect('/')

export default {
  getIndex,
  getChatPage,
  getRooms,
  postRoom,
  getUploadPage,
  postUpload
}
