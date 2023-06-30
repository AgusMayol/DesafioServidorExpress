import { Router } from "express";
const router = Router();
import { productHandling, cartHandling } from "../server.js";

router.get('/', async (req, res) => {
    let limit = Number(req.query.limit) || undefined;
    let page = Number(req.query.page) || undefined;
    let sort = Number(req.query.sort) || undefined;
    let queryType = req.query.queryType || undefined;
    let queryValue = req.query.queryValue || undefined;

    const products = await productHandling.getProducts(limit, page, sort, queryType, queryValue);
    res.render('home', { title: "Productos", products: products });
})

router.get('/product/:pid', async (req, res) => {
    const id = req.params.pid;
    const product = await productHandling.getProductById(id);
    console.log(product)

    if (!product) {
        res.send("No se encontró el producto");
        return;
    }

    res.render('product', { title: "Producto", product: product });
})

router.get('/carts', async (req, res) => {
    let carts = await cartHandling.getCarts();
    res.render('carts', { title: "Carritos", carts: carts });
})

router.get('/realtimeproducts', async (req, res) => {
    res.render('realTimeProducts', { title: "Productos en Tiempo Real" })
});

router.get('/chat', async (req, res) => {
    res.render('chat', { title: "Chat" })
});

export default router;