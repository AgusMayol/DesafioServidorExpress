import express from "express";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import { Server } from "socket.io";

import ProductManager from "./classes/ProductsManager.class.js";
export const productHandling = new ProductManager();

import routerViews from "./routes/views.router.js";
import routerProducts from './routes/products.router.js';
import routerCart from './routes/cart.router.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use('/api/products/', routerProducts)
app.use('/api/carts/', routerCart)
app.use("/", routerViews);

const expressServer = app.listen(8080, () => console.log("Servidor levantado en el puerto 8080"));
const socketServer = new Server(expressServer);

const products = await productHandling.getProducts();

socketServer.on("connection", (socket) => {
    socketServer.emit('products', products);

    console.log("connected " + socket.id);

    // Añadimos el producto al archivo
    socket.on('addProduct', (product) => {
        productHandling.addProduct(product);
        console.log(product)
        console.log("Producto añadido al archivo!")
        socketServer.emit('products', products);
    })

    // Eliminamos el producto del archivo
    socket.on('deleteProduct', (productId) => {
        productHandling.deleteProduct(productId);
        console.log(productId)
        console.log("Producto eliminado del archivo!")
        socketServer.emit('products', products);
    })

});

export default socketServer;