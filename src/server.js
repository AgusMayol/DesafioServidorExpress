// ---------[CORE]--------
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import { Server } from "socket.io";

// ---------[ROUTERS]--------
import routerViews from "./routes/views.router.js";
import routerProducts from './routes/products.router.js';
import routerSessions from './routes/sessions.router.js';
import routerCart from './routes/cart.router.js';

import { intializePassport } from "./config/github.passport.js";
import passport from "passport";

// ---------[CLASS MANAGERS]--------
import ProductManager from "./daos/mongodb/ProductsManager.class.js";
export const productHandling = new ProductManager();

import ChatManager from "./daos/mongodb/ChatManager.class.js";
export const chatHandling = new ChatManager();

import CartManager from "./daos/mongodb/CartManager.class.js";
export const cartHandling = new CartManager();

import { SECRET, MONGODB_URL, PORT } from "./config.js";

const app = express();
const connection = mongoose.connect(
  MONGODB_URL,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
intializePassport();

app.use(
  session({
    store: new MongoStore({
      mongoUrl:
        MONGODB_URL,
    }),
    secret: SECRET,
    resave: true,
    saveUninitialized: false,
  })
);

app.use(passport.initialize())

app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use("/", routerViews);
app.use('/api/products/', routerProducts)
app.use('/api/sessions/', routerSessions)
app.use('/api/carts/', routerCart)

const expressServer = app.listen(PORT, () => console.log("🌐 Servidor levantado en el puerto 8080"));
const socketServer = new Server(expressServer);

socketServer.on("connection", async (socket) => {

  console.log("・Usuario conectado: " + socket.id);

  socket.emit('fetch'); //Hace que el usuario haga un fetch para conseguir el listado de productos
  socket.emit('mensajes', await chatHandling.getMessages()); //Pendiente: hacerlo en formato de fetch individual.

  // ---------[REAL TIME PRODUCTS]--------

  // Añadimos el producto al archivo
  socket.on('addProduct', async (product) => {
    await productHandling.addProduct(product);
    console.log("✅ Producto añadido a la base de datos\n")
    socketServer.emit('fetch')
  })

  // Eliminamos el producto del archivo
  socket.on('deleteProduct', async (productId) => {
    console.log(`- ID del producto a eliminar: ${productId}`)
    await productHandling.deleteProduct(productId);
    console.log("✅ Producto eliminado de la base de datos\n")
    socketServer.emit('fetch')
  })

  // ---------[CHAT]--------

  // Añadimos el producto al archivo
  socket.on('addMessage', async (message) => {
    await chatHandling.addMessage(message);
    console.log("✅ Mensaje guardado en la base de datos\n")
    socketServer.emit('mensajes', await chatHandling.getMessages()); //Pendiente: hacerlo en formato de fetch individual.
  })

  // Eliminamos el producto del archivo
  socket.on('deleteMessage', async (messageId) => {
    console.log(`- ID del mensaje a eliminar: ${messageId}`)
    await chatHandling.deleteMessage(messageId);
    console.log("✅ Mensaje eliminado de la base de datos\n")
    socketServer.emit('mensajes', await chatHandling.getMessages()); //Pendiente: hacerlo en formato de fetch individual.
  })

});

export default socketServer;