import mongoose from 'mongoose'

const collection = "products"

const ProductsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
})

export const productsModel = mongoose.model(collection, ProductsSchema)