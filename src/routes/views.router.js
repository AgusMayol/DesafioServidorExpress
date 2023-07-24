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
    res.render('home', { title: "Productos", products: products, user: req.session.user });
})

router.get('/product/:pid', async (req, res) => {
    const id = req.params.pid;
    const product = await productHandling.getProductById(id);

    res.render('product', { title: "Producto", product: product, user: req.session.user });
})

router.get('/carts', async (req, res) => {
    let carts = await cartHandling.getCarts();
    res.render('carts', { title: "Carritos", carts: carts, user: req.session.user });
})

router.get('/realtimeproducts', async (req, res) => {

    if (!req.session.user) return res.redirect('/login');

    let nivel = req.session.user.level || 0;

    if (nivel < 1) {
        return res.status(401).send({ status: "unauthorized", message: "No tienes permisos suficientes" });
    }

    res.render('realTimeProducts', { title: "Productos en Tiempo Real", user: req.session.user })
});

router.get('/chat', async (req, res) => {
    res.render('chat', { title: "Chat", user: req.session.user })
});

router.get('/register', (req, res) => {
    res.render('register');
})

router.get('/login', (req, res) => {
    res.render('login');
})

router.get('/resetPassword', (req, res) => {
    res.render('resetPassword');
})


export default router;