import fs from "fs";
import { v4 as uuidV4 } from "uuid";

export default class ProductManager {
    constructor() {
        this.products = [];
        this.path = "./src/classes/files/products.json";
    }

    getFile = async () => {
        try {
            const data = await fs.promises.readFile(this.path, "utf-8");
            const products = JSON.parse(data);
            return products;
        } catch (error) {
            console.log("Error al leer el archivo");
            return [];
        }
    };

    getProducts = async (limit) => {
        this.products = await this.getFile();
        if (this.products.length === 0) {
            console.log("No hay productos cargados");
            return [];
        } else {
            if (limit) {
                return this.products.slice(0, limit);
            } else {
                return this.products;
            }
        }
    };

    getProductByCode = async (code) => {
        this.products = await this.getFile();
        const product = this.products.find((product) => product.code === code);
        if (product === undefined) {
            console.log("Product Not found");
            return "Product Not found";
        } else {
            return product;
        }
    };

    getProductById = async (id) => {
        this.products = await this.getFile();
        const product = this.products.find((product) => product.id === id);
        if (product === undefined) {
            console.log("Product Not found");
            return "Product Not found";
        } else {
            return product;
        }
    };

    addProduct = async (info) => {
        //Verificamos que los datos existan y correspondan al tipo de dato
        if (
            typeof info.title === "string" &&
            typeof info.description === "string" &&
            typeof info.price === "number" &&
            typeof info.code === "string" &&
            typeof info.stock === "number" &&
            typeof info.category === "string"
        ) {
            const products = await this.getFile();
            info.id = uuidV4();
            info.status = true;

            products.push(info);
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, "\t"));
            return info;
        } else {
            console.log("Necesitas rellenar los campos según su tipo de dato");
        }
    };

    updateProduct = async (id, info) => {
        const products = await this.getFile();
        this.products = products;

        const productById = await this.getProductById(id);
        if (productById === "Product Not found") {
            console.log("Error, no se puede actualizar un producto inexistente");
            return;
        }

        const productFound = this.products.find((product) => product.id === id);

        // Verificamos que los datos existan y correspondan al tipo de dato
        if (typeof info.title === "string") {
            productFound.title = info.title;
        }
        if (typeof info.description === "string") {
            productFound.description = info.description;
        }
        if (typeof info.price === "number") {
            productFound.price = info.price;
        }
        if (typeof info.code === "string") {
            productFound.code = info.code;
        }
        if (typeof info.stock === "number") {
            productFound.stock = info.stock;
        }
        if (typeof info.category === "string") {
            productFound.category = info.category;
        }
        if (typeof info.status === "boolean") {
            productFound.status = info.status;
        }
        if (typeof info.thumbnail === "string") {
            productFound.thumbnail = info.thumbnail;
        }

        await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, "\t"));
        console.log("Producto Actualizado");
    };

    deleteProduct = async (id) => {
        const products = await this.getFile();
        this.products = products;

        const productById = await this.getProductById(id);
        if (productById === "Product Not found") {
            console.log("Error, no se puede eliminar un producto inexistente");
            return;
        }

        const index = this.products.findIndex((product) => product.id === id);
        this.products.splice(index, 1);

        await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, "\t"));
        console.log("Producto Eliminado");
    };
}
