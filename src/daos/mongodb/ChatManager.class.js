import mongoose from "mongoose";
import { chatModel } from "./models/messages.model.js";
import { MONGODB_URL } from "../../config.js";

export default class ChatManager {
    connection = mongoose.connect(MONGODB_URL)

    getMessages = async (limite = null) => {
        let result = await chatModel.find().limit(limite).lean()
        return result
    };

    addMessage = async (message) => {
        let result = await chatModel.create(message)
        return result
    };

    deleteMessage = async (id) => {
        let result = await chatModel.deleteOne({ _id: id })
        return result
    };
}
