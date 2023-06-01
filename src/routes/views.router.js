import { Router } from "express";
const router = Router();
import { productHandling } from "../server.js";

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

export default router;