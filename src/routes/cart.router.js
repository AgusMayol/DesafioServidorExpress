import { Router } from "express";
import CartManager from "../classes/CartManager.class.js";

const router = Router();

const cartHandling = new CartManager();

//GET

router.get("/", async (req, res) => {
    const limit = req.query.limit; // Obtener el valor del query ?limit=
    const carts = await cartHandling.getFile(limit);
    res.send(carts);
});

router.get("/:cid", async (req, res) => {
    const id = req.params.cid;
    const cart = await cartHandling.getCartById(id);
    res.send(cart);
});

//POST

router.post("/", async (req, res) => {
    await cartHandling.addCart();
    res.send({ status: "success" });
});

router.post("/:cid/products/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.query.quantity; // Obtener la cantidad de productos a comprar ?quantity=

    await cartHandling.addProductToCart(cartId, productId, quantity);
    res.send({ status: "success" });
});

export default router;