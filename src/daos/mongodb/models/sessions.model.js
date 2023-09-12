import mongoose from 'mongoose'

const collection = "users"

const SessionSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        default: "",
        required: false
    },
    email: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        required: true,
        default: 0 // Valor predeterminado: 0 = user, 1 = admin
    },
    premium: {
        type: Boolean,
        required: true,
        default: false
    },
    cartId: {
        type: String,
        required: true,
    }
})

export const sessionModel = mongoose.model(collection, SessionSchema)