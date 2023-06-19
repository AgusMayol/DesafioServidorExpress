import mongoose from "mongoose";
import { cartModel } from "./models/carts.model.js";
import ProductManager from "./ProductsManager.class.js";

export default class CartManager {
    connection = mongoose.connect(`mongodb+srv://batidalibertades0v:8X2eZX8ZERasqr1F@cluster0.khmfj9q.mongodb.net/Coder?retryWrites=true&w=majority`)

    productHandling = new ProductManager();

    getCarts = async (limite = null) => {
        const result = await cartModel.find().limit(limite).populate('products.product')
        return result
    };

    getCartById = async (id) => {
        const result = await cartModel.findOne({ _id: id }).populate('products.product')
        console.log(result)
        return result
    };

    addCart = async () => {
        const result = await cartModel.create({ products: [] })
        return result
    };

    addProductToCart = async (idCart, idProduct, cantidad = null) => {
        const product = await this.productHandling.getProductById(idProduct)
        const cart = await this.getCartById(idCart)
        cart.products.push({ product: product })
        await cart.save()
        return;
    };
}