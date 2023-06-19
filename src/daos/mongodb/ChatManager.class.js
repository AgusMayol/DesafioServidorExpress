import mongoose from "mongoose";
import { chatModel } from "./models/messages.model.js";

export default class ChatManager {
    connection = mongoose.connect(`mongodb+srv://batidalibertades0v:8X2eZX8ZERasqr1F@cluster0.khmfj9q.mongodb.net/Coder?retryWrites=true&w=majority`)

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
