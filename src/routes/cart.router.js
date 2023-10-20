import { Router } from "express";
import CartManager from "../daos/mongodb/CartManager.class.js";
import ProductManager from "../daos/mongodb/ProductsManager.class.js";
import { sessionModel } from "../daos/mongodb/models/sessions.model.js";
import { TicketModel } from "../daos/mongodb/models/ticket.model.js";
import { sendEmail } from "../mail.js";
import errors from "../errors.json" assert { type: 'json' };

const router = Router();

const cartHandling = new CartManager();
const productHandling = new ProductManager();

//GET

//Obtener TODOS los carritos
router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit || undefined;
        const carts = await cartHandling.getCarts(limit);
        res.send(carts);
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

//Obtener un carrito por ID
router.get("/:cid", async (req, res) => {
    try {
        const id = req.params.cid;
        const cart = await cartHandling.getCartById(id);
        res.send(cart);
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

//POST

//Crear carrito
router.post("/", async (req, res) => {
    try {
        let response = await cartHandling.addCart();
        res.send({ status: "success", response: response });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

//Añadir producto al carrito
router.post("/:cid/products/:pid", async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.query.quantity || undefined;

        if (!req.session.user) return res.status(401).send(errors.login);
        if (req.session.user.cartId != cartId && req.session.user.level < 1) return res.status(401).send(errors.notYourAccount);

        const product = await productHandling.getProductById(productId);

        if (!product) return res.status(404).send({ status: "error", message: "Product not found" });

        if (product.owner == req.session.user.userId && product.owner != "admin") {
            return res.status(401).send({ status: "error", message: "Unauthorized, you cannot add your own product to the cart." });
        }

        await cartHandling.addProductToCart(cartId, productId, quantity);
        res.send({ status: "success" });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

//Reemplazar los productos de un carrito
router.post("/:cid", async (req, res) => {
    try {
        const cartId = req.params.cid;
        const products = req.query.products || undefined;

        if (!req.session.user) return res.status(401).send(errors.login);
        if (req.session.user.cartId != cartId && req.session.user.level < 1) return res.status(401).send(errors.notYourAccount);

        await cartHandling.replaceProducts(cartId, products);
        res.send({ status: "success" });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

//Cambiar la cantidad de un producto en un carrito
router.post("/:cid/productQuantity/:pid", async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.query.quantity || undefined;

        if (!req.session.user) return res.status(401).send({ status: "error", message: "Unauthorized, please log in." });
        if (req.session.user.cartId != cartId && req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, this is not your account." });

        await cartHandling.changeProductQuantity(cartId, productId, quantity);
        res.send({ status: "success" });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

//Crear ticket de la compra
router.post("/:cid/purchase", async (req, res) => {
    try {
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

        sendEmail(user.email, "[TEST] Thanks for your purchase!", `you have purchased ${amount} items in our store!`)

        const ticket = await TicketModel.create({ amount: amount, missing: missing, purchaser: purchaser });

        res.send(ticket);
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

//DELETE

//Eliminar un producto de un carrito
router.delete("/:cid/product/:pid", async (req, res) => {
    try {
        let cartId = req.params.cid;
        let productId = req.params.pid;

        if (!req.session.user) return res.status(401).send(errors.login);
        if (req.session.user.cartId != cartId && req.session.user.level < 1) return res.status(401).send(errors.notYourAccount);

        await cartHandling.deleteProductFromCart(cartId, productId);

        res.send({ status: "success" });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

//Eliminar TODOS los productos de un carrito
router.delete("/:cid", async (req, res) => {
    try {
        let cartId = req.params.cid;

        if (!req.session.user) return res.status(401).send(errors.login);
        if (req.session.user.cartId != cartId && req.session.user.level < 1) return res.status(401).send(errors.notYourAccount);

        await cartHandling.deleteAllProductsFromCart(cartId);
        res.send({ status: "success" });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

//Eliminar un carrito, no solo los productos
router.delete("/deleteCart/:cid", async (req, res) => {
    try {
        let cartId = req.params.cid;

        if (!req.session.user) return res.status(401).send(errors.login);
        if (req.session.user.cartId != cartId && req.session.user.level < 1) return res.status(401).send(errors.notYourAccount);

        await cartHandling.deleteCart(cartId);
        res.send({ status: "success" });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

export default router;