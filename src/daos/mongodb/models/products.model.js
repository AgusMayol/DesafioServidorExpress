import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

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
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        default: "admin"
    },
    photos: [
        {
            name: {
                type: String,
            },
            reference: {
                type: String,
            },
        },
    ],
})

ProductsSchema.plugin(mongoosePaginate)
export const productsModel = mongoose.model(collection, ProductsSchema)