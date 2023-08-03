import mongoose from "mongoose";

const collection = "carts"

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "products",
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
            },
        },
    ],
});


export const cartModel = mongoose.model(collection, cartSchema)