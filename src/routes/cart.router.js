import { Router } from "express";
import CartManager from "../daos/mongodb/CartManager.class.js";

const router = Router();

const cartHandling = new CartManager();

//GET

router.get("/", async (req, res) => {
    const limit = req.query.limit || undefined;
    const carts = await cartHandling.getCarts(limit);
    res.send(carts);
});

router.get("/:cid", async (req, res) => {
    const id = req.params.cid;
    const cart = await cartHandling.getCartById(id);
    res.send(cart);
});

//POST

router.post("/", async (req, res) => {
    let response = await cartHandling.addCart();
    res.send({ status: "success", response: response });
});

router.post("/:cid/products/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.query.quantity || undefined;

    await cartHandling.addProductToCart(cartId, productId, quantity);
    res.send({ status: "success" });
});

router.post("/:cid", async (req, res) => {
    const cartId = req.params.cid;
    const products = req.query.products || undefined;

    await cartHandling.replaceProducts(cartId, products);
    res.send({ status: "success" });
});

router.post("/:cid/productQuantity/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.query.quantity || undefined;

    await cartHandling.changeProductQuantity(cartId, productId, quantity);
    res.send({ status: "success" });
});

//DELETE

router.delete("/:cid/product/:pid", async (req, res) => {
    let cartId = req.params.cid;
    let productId = req.params.pid;

    await cartHandling.deleteProductFromCart(cartId, productId);

    res.send({ status: "success" });
});

router.delete("/:cid", async (req, res) => {
    let cartId = req.params.cid;
    await cartHandling.deleteAllProductsFromCart(cartId);
    res.send({ status: "success" });
});

router.delete("/deleteCart/:cid", async (req, res) => {
    let cartId = req.params.cid;
    await cartHandling.deleteCart(cartId);
    res.send({ status: "success" });
});

export default router;