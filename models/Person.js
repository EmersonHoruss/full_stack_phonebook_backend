const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
mongoose.set('strictQuery', false)
mongoose.connect(url)
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [3, "Name must have at least 3 characters"],
        required: [true, "Name is required"]
    },
    number: {
        type: String,
        minLength: [8, "Number must have at least 8 characters"],
        validate: {
            validator: function (v) {
                return /\d{2,3}-\d+/.test(v);
            },
            message: props => `${props.value} is not a valid number. A valid number must be formed of two parts that are separated by -, the first part has two or three numbers and the second part also consists of numbers`
        },
        required: [true, "Number is required"]
    },
})
personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model("Person", personSchema)
