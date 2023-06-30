import mongoose from "mongoose";
import { cartModel } from "./models/carts.model.js";
import ProductManager from "./ProductsManager.class.js";

export default class CartManager {
    connection = mongoose.connect(
        `mongodb+srv://batidalibertades0v:8X2eZX8ZERasqr1F@cluster0.khmfj9q.mongodb.net/Coder?retryWrites=true&w=majority`
    );

    productHandling = new ProductManager();

    getCarts = async (limit = null) => {
        const result = await cartModel
            .find()
            .limit(limit)
            .populate("products.product")
            .lean();
        return result;
    };

    getCartById = async (id) => {
        const result = await cartModel
            .findOne({ _id: id })
            .populate("products.product");
        return result;
    };

    addCart = async () => {
        const result = await cartModel.create({ products: [] });
        return result;
    };

    addProductToCart = async (idCart, idProduct, cantidad = 1) => {
        const product = await this.productHandling.getProductById(idProduct);
        const cart = await this.getCartById(idCart);
        const newProduct = {
            product: product._id,
            quantity: cantidad,
        };
        cart.products.push(newProduct);
        await cart.save();
    };

    deleteCart = async (id) => {
        let result = await cartModel.deleteOne({ _id: id });
        return result;
    };

    deleteProductFromCart = async (cid, pid) => {
        const cart = await this.getCartById(cid);
        cart.products = cart.products.filter((product) => {
            return product._id.toString() !== pid.toString();
        });
        await cart.save();
    };

    deleteAllProductsFromCart = async (cid) => {
        const cart = await this.getCartById(cid);
        cart.products = [];
        await cart.save();
    };
}
