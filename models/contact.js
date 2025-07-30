const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URI

console.log('- Connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('- Connected to MongoDB')
  })
  .catch((error) => {
    console.log('- Error connecting to MongoDB:', error.message)
  })

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: [true, 'Name required']
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{2,3}-\d{5,}$/.test(v) && v.length >= 8
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'Phone number required']
  },
})

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Contact', contactSchema)