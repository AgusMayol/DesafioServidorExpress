import mongoose from 'mongoose'

const collection = "messages"

const ChatSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    messageContent: {
        type: String,
        required: true
    },
})

export const chatModel = mongoose.model(collection, ChatSchema)