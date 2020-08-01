import mongoose from 'mongoose'

const roomSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    messages: [{
      text: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
       createdAt: { type: Date, default: Date.now }
    }],
    activeUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
});

// module.exports = mongoose.model('Room', roomSchema);

export default mongoose.model('Room', roomSchema)
