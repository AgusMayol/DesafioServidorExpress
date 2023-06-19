import express from "express";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import { Server } from "socket.io";

import ProductManager from "./daos/mongodb/ProductsManager.class.js";
export const productHandling = new ProductManager();

import ChatManager from "./daos/mongodb/ChatManager.class.js";
export const chatHandling = new ChatManager();

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

app.use("/", routerViews);
app.use('/api/products/', routerProducts)
app.use('/api/carts/', routerCart)

const expressServer = app.listen(8080, () => console.log("Servidor levantado en el puerto 8080"));
const socketServer = new Server(expressServer);

const productos = await productHandling.getProducts();
const mensajes = await chatHandling.getMessages();

socketServer.on("connection", (socket) => {
    socketServer.emit('products', productos);
    socketServer.emit('mensajes', mensajes);

    console.log("connected " + socket.id);

    // Añadimos el producto al archivo
    socket.on('addProduct', async (product) => {
        await productHandling.addProduct(product);
        console.log(product)
        console.log("Producto añadido a la base de datos")
        socketServer.emit('products', await productHandling.getProducts());
    })

    // Eliminamos el producto del archivo
    socket.on('deleteProduct', async (productId) => {
        await productHandling.deleteProduct(productId);
        console.log(productId)
        console.log("Producto eliminado de la base de datos")
        socketServer.emit('products', await productHandling.getProducts());
    })

    // ---------[CHAT]--------

    // Añadimos el producto al archivo
    socket.on('addMessage', async (message) => {
        await chatHandling.addMessage(message);
        console.log(message)
        console.log("Mensaje guardado en la base de datos")
        socketServer.emit('mensajes', await chatHandling.getMessages());
    })

    // Eliminamos el producto del archivo
    socket.on('deleteMessage', async (messageId) => {
        await chatHandling.deleteMessage(messageId);
        console.log(messageId)
        console.log("Mensaje eliminado de la base de datos")
        socketServer.emit('mensajes', await chatHandling.getMessages());
    })

});

export default socketServer;