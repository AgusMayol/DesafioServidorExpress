import fs from "fs";
import { v4 as uuidV4 } from "uuid";

export default class CartManager {
    constructor() {
        this.carts = [];
        this.path = "src/classes/files/carts.json";
    }

    getFile = async (limit) => {
        if (fs.existsSync(this.path)) {
            const data = await fs.promises.readFile(this.path, "utf-8");
            const carts = JSON.parse(data);
            if (limit) {
                return carts.slice(0, limit);
            } else {
                return carts;
            }
        } else {
            return [];
        }
    };

    getCartById = async (id) => {
        const carts = await this.getFile();

        const cart = carts.find((cart) => {
            return cart.id == id;
        });

        return cart ? cart : "carrito no encontrado";
    };

    addCart = async () => {
        const carts = await this.getFile();
        carts.push({ id: uuidV4(), products: [] });
        return await fs.promises.writeFile(this.path, JSON.stringify(carts, null, "\t"));
    };

    addProductToCart = async (idCart, idProduct, cantidad) => {
        if (!cantidad) cantidad = 1;
        const cart = await this.getCartById(idCart);

        const index = cart.products.findIndex((product) => {
            return product.id == idProduct;
        });

        if (index === -1) {
            cart.products.push({ id: idProduct, quantity: 1 });
        } else {
            cart.products[index].quantity += parseInt(cantidad);
        }

        const carts = await this.getFile()
        const cartIndex = carts.findIndex((cartIterator) => {
            return cartIterator.id == cart.id
        })

        carts[cartIndex] = cart

        return await fs.promises.writeFile(this.path, JSON.stringify(carts, null, "\t"))

    };
}