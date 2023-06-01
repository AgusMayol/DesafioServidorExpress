import { Router } from "express";
import ProductManager from "../classes/ProductsManager.class.js";

const router = Router();

const productHandling = new ProductManager();

//GET

router.get("/", async (req, res) => {
    const limit = req.query.limit;
    const products = await productHandling.getProducts(limit);
    res.send({ products });
});

router.get("/:pid", async (req, res) => {
    const id = req.params.pid;
    const product = await productHandling.getProductById(id);
    res.send({ product });
});

//PUT

router.put("/:pid", async (req, res) => {
    const id = req.params.pid;
    const data = req.body;
    console.log(req.body);

    productHandling.updateProduct(id, data);
    res.send({ status: "success" });
});

//DELETE

router.delete("/:pid", async (req, res) => {
    const id = req.params.pid;

    productHandling.deleteProduct(id);
    res.send({ status: "success" });
});

//POST

router.post("/", async (req, res) => {
    console.log(req.body);
    const product = req.body;

    productHandling.addProduct(product);
    res.send({ status: "success" });
});

export default router;