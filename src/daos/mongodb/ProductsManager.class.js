import mongoose from "mongoose";
import { productsModel } from "./models/products.model.js";
import { MONGODB_URL } from "../../config.js";

export default class ProductManager {
    connection = mongoose.connect(MONGODB_URL)

    getProducts = async (limit = 10, page = 1, sort = 1, queryType = null, queryValue = null) => {
        let whereOptions = {};

        if (queryType != "" && queryValue != "") {
            whereOptions = { [queryType]: queryValue };
        }

        let result = await productsModel.paginate(whereOptions, {
            limit: limit,
            page: page,
            sort: { price: sort },
            lean: true,
        });
        return result;
    }

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
