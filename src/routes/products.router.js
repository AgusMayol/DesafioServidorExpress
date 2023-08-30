import { Router } from "express";
import ProductManager from "../daos/mongodb/ProductsManager.class.js";

const router = Router();

const productHandling = new ProductManager();

//GET

//Obtener TODOS los productos
router.get("/", async (req, res) => {
    try {
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
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

//Obtener un producto por su ID
router.get("/:pid", async (req, res) => {
    try {
        const id = req.params.pid;
        const product = await productHandling.getProductById(id);

        if (!product) {
            res.send("No se encontró el producto");
            return;
        }

        res.send(product);
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

//PUT

//Actualizar un producto
router.put("/:pid", async (req, res) => {
    try {
        const id = req.params.pid;
        const data = req.body;

        if (!req.session.user) return res.status(401).send({ status: "error", message: "Unauthorized, please log in." });
        if (req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, you must be an admin." });

        productHandling.updateProduct(id, data);
        res.send({ status: "success" });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

//DELETE

//Eliminar un producto
router.delete("/:pid", async (req, res) => {
    try {
        const id = req.params.pid;

        if (!req.session.user) return res.status(401).send({ status: "error", message: "Unauthorized, please log in." });
        if (req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, you must be an admin." });

        productHandling.deleteProduct(id);
        res.send({ status: "success" });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

//POST

//Añadir un producto
router.post("/", async (req, res) => {
    try {
        const product = req.body;

        if (!req.session.user) return res.status(401).send({ status: "error", message: "Unauthorized, please log in." });
        if (req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, you must be an admin." });

        productHandling.addProduct(product);
        res.send({ status: "success" });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

export default router;