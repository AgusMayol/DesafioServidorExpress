import mongoose from "mongoose";
import { productsModel } from "./models/products.model.js";

export default class ProductManager {
    connection = mongoose.connect(`mongodb+srv://batidalibertades0v:8X2eZX8ZERasqr1F@cluster0.khmfj9q.mongodb.net/Coder?retryWrites=true&w=majority`)

    getProducts = async (limite = null) => {
        let result = await productsModel.find().limit(limite).lean()
        return result
    };

    getProductById = async (id) => {
        let result = await productsModel.findOne({ _id: id }).lean()
        return result
    };

    addProduct = async (product) => {
        let result = await productsModel.create(product)
        return result
    };

    updateProduct = async (id, product) => {
        let result = await productsModel.updateOne({ _id: id }, { $set: product })
        return result
    };

    deleteProduct = async (id) => {
        let result = await productsModel.deleteOne({ _id: id })
        return result
    };
}
