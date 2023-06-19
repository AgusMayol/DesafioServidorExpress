import { Router } from "express";
const router = Router();
import { productHandling, chatHandling } from "../server.js";

router.get('/', async (req, res) => {
    await productHandling.getProducts().then((products) => {
        res.render('home', { title: "Productos", products })
    });
});

router.get('/realtimeproducts', async (req, res) => {
    await productHandling.getProducts().then(() => {
        res.render('realTimeProducts', { title: "Productos" })
    });
});

router.get('/chat', async (req, res) => {
    await chatHandling.getMessages().then(() => {
        res.render('chat', { title: "Chat" })
    });
});

export default router;