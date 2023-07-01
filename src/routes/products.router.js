import { Router } from "express";
import ProductManager from "../daos/mongodb/ProductsManager.class.js";

const router = Router();

const productHandling = new ProductManager();

//GET

router.get("/", async (req, res) => {
    let limit = Number(req.query.limit) || undefined;
    let page = Number(req.query.page) || undefined;
    let sort = Number(req.query.sort) || undefined;
    let queryType = req.query.queryType || undefined;
    let queryValue = req.query.queryValue || undefined;

    const products = await productHandling.getProducts(limit,
        page,
        sort,
        queryType,
        queryValue);
    res.send(products);
});

router.get("/:pid", async (req, res) => {
    const id = req.params.pid;
    const product = await productHandling.getProductById(id);

    if (!product) {
        res.send("No se encontró el producto");
        return;
    }

    res.send(product);
});

//PUT

router.put("/:pid", async (req, res) => {
    const id = req.params.pid;
    const data = req.body;

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