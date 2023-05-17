import fs from "fs";

export default class ProductManager {
    constructor() {
        this.products = [];
        this.path = "./src/classes/files/products.json";
    }

    getFile = async () => {
        try {
            const data = await fs.promises.readFile(this.path, "utf-8");
            const products = await JSON.parse(data);
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
        const product = await this.products.find(
            (product) => product.code === code
        );
        if (product === undefined) {
            console.log("Product Not found");
            return "Product Not found";
        } else {
            return product;
        }
    };

    getProductById = async (id) => {
        this.products = await this.getFile();
        const product = await this.products.find((product) => product.id === parseInt(id));
        if (product === undefined) {
            console.log("Product Not found");
            return "Product Not found";
        } else {
            return product;
        }
    };

    addProduct = async (title, description, price, thumbnail, code, stock) => {
        if (
            title === null ||
            description === null ||
            price === null ||
            thumbnail === null ||
            stock === null
        ) {
            console.log("Error, no se puede agregar un producto con datos nulos");
            return;
        }

        const products = await this.getFile();
        this.products = products;

        console.log(this.products);

        const product = {
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
        };

        if (this.products.length === 0) {
            product.id = 1;
        } else {
            product.id = this.products[this.products.length - 1].id + 1;
        }

        console.log(product);

        const productByCode = await this.getProductByCode(code);
        console.log(`producto por codigo ${productByCode}`);

        if (productByCode !== "Product Not found") {
            console.log("Error, no se puede agregar un producto con codigo repetido");
            return;
        } else {
            this.products.push(product);
            await fs.promises.writeFile(this.path, JSON.stringify(this.products));
            console.log("Producto agregado");
        }
    };

    updateProduct = async (id, prop, value) => {
        const products = await this.getFile();
        this.products = products;

        const productById = await this.getProductById(id);
        if (productById === "Product Not found") {
            console.log("Error, no se puede actualizar un producto inexistente");
            return;
        }

        const producFound = await this.products.find(
            (product) => product.id === id
        );

        producFound[prop] = value;

        await fs.promises.writeFile(this.path, JSON.stringify(this.products));
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

        await fs.promises.writeFile(this.path, JSON.stringify(this.products));
        console.log("Producto Eliminado");
    };
}

// Testing

const productHandling = new ProductManager();

(async () => {
    await productHandling.addProduct(
        "Módulo multi-serial serie QX",
        "Isla de válvulas Camozzi",
        2500,
        "https://sitio.com/imagen.png",
        "abc123",
        4821
    );

    await productHandling.addProduct(
        "Cilindro serie 61",
        "Cilindro neumático Camozzi",
        2500,
        "https://sitio.com/imagen.png",
        "abc124",
        101
    );

    await productHandling.addProduct(
        "Racor serie 6000M",
        "Racor super rápido Camozzi",
        2500,
        "https://sitio.com/imagen.png",
        "abc128",
        521
    );
})();