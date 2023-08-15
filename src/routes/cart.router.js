import { Router } from "express";
import CartManager from "../daos/mongodb/CartManager.class.js";
import ProductManager from "../daos/mongodb/ProductsManager.class.js";
import { sessionModel } from "../daos/mongodb/models/sessions.model.js";
import { TicketModel } from "../daos/mongodb/models/ticket.model.js";

const router = Router();

const cartHandling = new CartManager();
const productHandling = new ProductManager();

//GET

//Obtener TODOS los carritos
router.get("/", async (req, res) => {
    const limit = req.query.limit || undefined;
    const carts = await cartHandling.getCarts(limit);
    res.send(carts);
});

//Obtener un carrito por ID
router.get("/:cid", async (req, res) => {
    const id = req.params.cid;
    const cart = await cartHandling.getCartById(id);
    res.send(cart);
});

//POST

//Crear carrito
router.post("/", async (req, res) => {
    let response = await cartHandling.addCart();
    res.send({ status: "success", response: response });
});

//Añadir producto al carrito
router.post("/:cid/products/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.query.quantity || undefined;

    if (!req.session.user) return res.status(401).send({ status: "error", message: "Unauthorized, please log in." });
    if (req.session.user.cartId != cartId && req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, this is not your account." });

    await cartHandling.addProductToCart(cartId, productId, quantity);
    res.send({ status: "success" });
});

//Reemplazar los productos de un carrito
router.post("/:cid", async (req, res) => {
    const cartId = req.params.cid;
    const products = req.query.products || undefined;

    if (!req.session.user) return res.status(401).send({ status: "error", message: "Unauthorized, please log in." });
    if (req.session.user.cartId != cartId && req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, this is not your account." });

    await cartHandling.replaceProducts(cartId, products);
    res.send({ status: "success" });
});

//Cambiar la cantidad de un producto en un carrito
router.post("/:cid/productQuantity/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.query.quantity || undefined;

    if (!req.session.user) return res.status(401).send({ status: "error", message: "Unauthorized, please log in." });
    if (req.session.user.cartId != cartId && req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, this is not your account." });

    await cartHandling.changeProductQuantity(cartId, productId, quantity);
    res.send({ status: "success" });
});

//Crear ticket de la compra
router.post("/:cid/purchase", async (req, res) => {
    const cartId = req.params.cid;

    //Valores finales del ticket
    let amount = 0;
    let missing = 0;
    let purchaser = "";


    if (!req.session.user) return res.status(401).send({ status: "error", message: "Unauthorized, please log in." });
    if (req.session.user.cartId != cartId && req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, this is not your account." });

    const cart = await cartHandling.getCartById(cartId);

    for (const producto of cart.products) {

        const product = await productHandling.getProductById(producto.product._id);

        if (product.stock >= producto.quantity) {

            amount = amount + 1;
            let updatedStock = product.stock - producto.quantity;

            const deleteProductFromCart = await cartHandling.deleteProductFromCart(cartId, producto._id);
            const updateProduct = await productHandling.updateProduct(product._id, { stock: updatedStock });

        } else {

            missing = missing + 1;

        }

    }

    if (amount == 0) return res.status(500).send({ status: "error", message: "There is no stock left for the products in the cart." });

    const user = await sessionModel.findOne({ cartId: cartId }).select('-password');

    purchaser = user.email;

    const ticket = await TicketModel.create({ amount: amount, missing: missing, purchaser: purchaser });

    res.send(ticket);
});

//DELETE

//Eliminar un producto de un carrito
router.delete("/:cid/product/:pid", async (req, res) => {
    let cartId = req.params.cid;
    let productId = req.params.pid;

    if (!req.session.user) return res.status(401).send({ status: "error", message: "Unauthorized, please log in." });
    if (req.session.user.cartId != cartId && req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, this is not your account." });

    await cartHandling.deleteProductFromCart(cartId, productId);

    res.send({ status: "success" });
});

//Eliminar TODOS los productos de un carrito
router.delete("/:cid", async (req, res) => {
    let cartId = req.params.cid;

    if (req.session.user.cartId != cartId && req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, this is not your account." });

    await cartHandling.deleteAllProductsFromCart(cartId);
    res.send({ status: "success" });
});

//Eliminar un carrito, no solo los productos
router.delete("/deleteCart/:cid", async (req, res) => {
    let cartId = req.params.cid;

    if (req.session.user.cartId != cartId && req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, this is not your account." });

    await cartHandling.deleteCart(cartId);
    res.send({ status: "success" });
});

export default router;