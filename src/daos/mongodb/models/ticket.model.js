import mongoose from 'mongoose'
import { v4 } from 'uuid';

const collection = "tickets"

const TicketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: true,
        default: v4(),
    },
    amount: {
        type: Number,
        required: true
    },
    missing: {
        type: Number,
        required: true,
        default: 0
    },
    purchaser: {
        type: String,
        required: true
    },
},
    { timestamps: true }
)

export const TicketModel = mongoose.model(collection, TicketSchema)