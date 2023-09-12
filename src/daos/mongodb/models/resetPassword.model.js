import mongoose from 'mongoose'
import { v4 } from 'uuid';

const collection = "resetPassword"

const PasswordSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: true,
        default: v4(),
    },
    isValid: {
        type: Boolean,
        required: true,
        default: false
    }
},

    { timestamps: true })

export const resetPasswordModel = mongoose.model(collection, PasswordSchema)