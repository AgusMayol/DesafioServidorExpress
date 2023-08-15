import mongoose from "mongoose";
import { cartModel } from "./models/carts.model.js";
import ProductManager from "./ProductsManager.class.js";
import { MONGODB_URL } from "../../config.js";

export default class CartManager {
    connection = mongoose.connect(MONGODB_URL);

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

    changeProductQuantity = async (cid, pid, quantity = 1) => {
        const cart = await this.getCartById(cid);
        const productIndex = cart.products.findIndex(
            (product) => product.product.toString() === pid
        );
        if (productIndex !== -1) {
            cart.products[productIndex].quantity = quantity;
            await cart.save();
        }
    };

    replaceProducts = async (cid, newProducts) => {
        const cart = await this.getCartById(cid);
        cart.products = newProducts;
        await cart.save();
    };


    deleteProductFromCart = async (cid, pid) => {
        const cart = await this.getCartById(cid);
        cart.products = cart.products.filter((product) => {
            return product._id.toString() !== pid.toString();
        });
        await cart.save();
        return cart
    };

    deleteAllProductsFromCart = async (cid) => {
        const cart = await this.getCartById(cid);
        cart.products = [];
        await cart.save();
    };
}
