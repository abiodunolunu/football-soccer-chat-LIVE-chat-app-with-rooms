import path, { dirname } from 'path'
import { fileURLToPath } from 'url';
import fs from 'fs'
import express from 'express'
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session'
import connectMongoDBSesion from 'connect-mongodb-session'
import cors from 'cors'
import flash from 'connect-flash'
import socketIO from './socket.js'
import csrf from 'csurf'
import helmet from 'helmet'
import dotenv from 'dotenv'
import compression from 'compression'
import Room from './models/Room.js'
import User from './models/User.js'
import indexRoute from './routes/index.js'
import authRoutes from './routes/auth.js'
import { userJoin, getCurrentUser, userLeave, getRoomUsers, getUserById } from './utils/users.js'
import formatMessage from './utils/messages.js';
import { cloudinaryConfig } from './utils/upload.js'
import morgan from 'morgan';
const MongoDBStore = (connectMongoDBSesion)(session)
dotenv.config({ path: './config/config.env' })
const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000;


const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions'
})
const app = express();
const csrfProtection = csrf()
const server = app.listen(PORT)
const io = socketIO.init(server)

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})


app.use(helmet())
app.use(compression())
app.use(morgan('combined', {stream: accessLogStream}))
app.use(cloudinaryConfig)

app.use(bodyParser.urlencoded({
  extended: false
}))




app.set('view engine', 'ejs');
app.set('views', 'views')
app.options('*', cors())

app.use(express.static('public'));
app.use('/images', express.static('images'))
app.use(session({
  secret: process.env.sessionSecret, resave: false, saveUninitialized: false, store: store
}))
app.use(csrfProtection)
app.use(flash())
app.use((req, res, next) => {
  res.locals.authenticated = req.session.isLoggedIn
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.csrfToken = req.csrfToken();
  next()
})
app.use(indexRoute)
app.use(authRoutes)


app.use(async (req, res, next) => {
  try {
    if (!req.session.user) {
      return next()
    }
    const user = await User.findById(req.session.user._id)
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
})

const botName = 'SoccerChat Bot'

socketIO.getIO().on('connection', (socket) => {
  console.log('Client is connected', socket.id)

  socket.on('joinRoom', userData => {
    const isUserPresent = getUserById(userData.USERID)
    if (isUserPresent) {
      userLeave(socket.id)
      const user = userJoin(socket.id, userData.USERID, userData.USERNAME, userData.ROOM, userData.userPicture);
      socket.join(user.room)
      socket.emit('message', formatMessage(botName, null, `You're logged in somewhere else I guess, but go on`))
      return
    }


    const user = userJoin(socket.id, userData.USERID, userData.USERNAME, userData.ROOM, userData.userPicture);

    socket.join(user.room)

    socketIO.getIO().to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
    // Welcome user
    socket.emit('message', formatMessage(botName, null, `Welcome to the ${user.room.toUpperCase()} room!`))
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, null, `${user.username} has entered the room!`))
  });
  socket.on('chatMessage', async (msg) => {
    // check if message is empty
    if (msg.replace(/\s/g, '') == '') {
      return socket.emit('message', formatMessage(botName, null, `You can't send a empty message!`))
    }
    const user = getCurrentUser(socket.id)
    const room = await Room.findOne({ name: user.room })
    room.messages.push({
      text: msg,
      sender: user.userId
    })
    await room.save()
    if (!user) {
      socket.emit('message', formatMessage(botName, null, 'Something went wrong, reload the page to try again'))
      return
    }
    socketIO.getIO().to(user.room).emit('message', formatMessage(user.username, user.userId, msg, user.userPicture))
  })

  socket.on('disconnect', () => {
    const user = userLeave(socket.id)
    if (user) {
      if (getUserById(user.userId)) {
        return
      }
      io.to(user.room).emit('message', formatMessage(botName, null, `${user.username} has left the chat`))
      socketIO.getIO().to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  })
});

app.use((error, req, res, next) => {
  res.status(500).render("error/500", {
    pageTitle: "Database Error",
    path: "DB Error",
  });
});

app.get('*', (req, res, next) => {
  res.status(404).render('error/404', {
    pageTitle: 'Error 404: Page Not Found',
    path: 'no page',
    url: req.url
  })
});

['log', 'warn'].forEach(function (method) {
  var old = console[method];
  console[method] = function () {
    var stack = (new Error()).stack.split(/\n/);
    // Chrome includes a single "Error" line, FF doesn't.
    if (stack[0].indexOf('Error') === 0) {
      stack = stack.slice(1);
    }
    var args = [].slice.apply(arguments).concat([stack[1].trim()]);
    return old.apply(console, args);
  };
});



mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(result => {
  console.log(`SERVER RUNNING ON ${PORT}`)
})
