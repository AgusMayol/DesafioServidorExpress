import { Router } from "express";
import __dirname from "../utils.js";
import ProductManager from "../daos/mongodb/ProductsManager.class.js";
import errors from "../errors.json" assert { type: 'json' };
import multer from "multer";
import { v4 } from 'uuid';
import { sessionModel } from "../daos/mongodb/models/sessions.model.js";

const products = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${__dirname}/uploads/products`);
    },
    filename: (req, file, cb) => {
        const randomUuid = v4();
        const fileName = randomUuid + file.originalname;

        cb(null, fileName);
    }
});

const uploadProducts = multer({ storage: products });

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
            return res.send("No se encontró el producto");
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

        const product = await productHandling.getProductById(id);

        if (!product) return res.status(404).send({ status: "error", message: "Product not found" });

        if (!req.session.user) return res.status(401).send(errors.login);
        if (req.session.user.level < 1 || product.owner != req.session.user.userId) return res.status(401).send(errors.lowPerms);

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

        const product = await productHandling.getProductById(id);

        if (!product) return res.status(404).send({ status: "error", message: "Product not found" });

        if (!req.session.user) return res.status(401).send(errors.login);
        if (req.session.user.level < 1 || product.owner != req.session.user.userId) return res.status(401).send(errors.lowPerms);

        if (product.owner != "admin") {
            let owner = await sessionModel.findOne({ _id: product.owner });

            if (owner.premium) {
                sendEmail(owner.email, "Someone has deleted one of your products", `Hello ${user.first_name}, someone has deleted your product: ${product.title}.`,)
            }
        }

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

        if (!req.session.user) return res.status(401).send(errors.login);
        if (req.session.user.level < 1 || req.session.user.premium != true) return res.status(401).send(errors.lowPerms);

        product.owner = req.session.user.userId;

        productHandling.addProduct(product);
        res.send({ status: "success" });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

router.post("/:pid/product/upload", uploadProducts.array('photos', 5), async (req, res) => {
    try {
        const pid = req.params.pid;

        if (!req.session.user) return res.status(401).send(errors.login);
        if (req.session.user.level < 1) return res.status(401).send(errors.lowPerms);

        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No se ha seleccionado ningún archivo.');
        }

        const product = await productHandling.getProductById(pid);

        if (!product) return res.status(404).send({ status: "error", message: "Product not found" });

        const photos = [];

        for (const file of req.files) {
            const archivo = { name: file.filename, reference: file.path }
            photos.push(archivo);
        }

        const result = await productHandling.updateProduct(pid, { photos });
        if (!result) return res.status(500).send({ status: "error", message: "Error al actualizar el producto" });

        res.status(200).send('Se han subido los archivos correctamente.');
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

export default router;