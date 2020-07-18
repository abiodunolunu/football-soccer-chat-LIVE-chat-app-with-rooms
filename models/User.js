import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  firstname: {
      type: String,
      required: true
  },
  lastname: {
    type: String,
    required: true
  },
  fullname: {
      type: String,
      required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  displayPicture: {
    type: String,
    default: 'assets\\smallball.jpg'
  },
  resetToken: String,
  resetTokenExpiration: Date
})
export default mongoose.model('User', userSchema)
