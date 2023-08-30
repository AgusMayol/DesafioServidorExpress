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
import routerMocking from './routes/mocking.router.js';

import { intializePassport } from "./config/github.passport.js";
import passport from "passport";

// ---------[CLASS MANAGERS]--------
import ProductManager from "./daos/mongodb/ProductsManager.class.js";
export const productHandling = new ProductManager();

import ChatManager from "./daos/mongodb/ChatManager.class.js";
export const chatHandling = new ChatManager();

import CartManager from "./daos/mongodb/CartManager.class.js";
export const cartHandling = new CartManager();

// ---------[OTHERS]--------
import { SECRET, MONGODB_URL, PORT } from "./config.js";
import { addLogger, log } from "./config/logger.config.js";

const app = express();
const connection = mongoose.connect(
  MONGODB_URL,
);

app.use(addLogger);
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
app.use('/api/mocking/', routerMocking)

const expressServer = app.listen(PORT, () => log.info("🌐 Servidor levantado en el puerto 8080"));
const socketServer = new Server(expressServer);

socketServer.on("connection", async (socket) => {

  socket.emit('fetch'); //Hace que el usuario haga un fetch para conseguir el listado de productos
  socket.emit('mensajes', await chatHandling.getMessages());

  // ---------[REAL TIME PRODUCTS]--------

  // Añadimos el producto al archivo
  socket.on('addProduct', async (product) => {
    await productHandling.addProduct(product);
    socketServer.emit('fetch')
  })

  // Eliminamos el producto del archivo
  socket.on('deleteProduct', async (productId) => {
    await productHandling.deleteProduct(productId);
    socketServer.emit('fetch')
  })

  // ---------[CHAT]--------

  // Añadimos el mensaje a la db
  socket.on('addMessage', async (message) => {
    await chatHandling.addMessage(message);
    socketServer.emit('mensajes', await chatHandling.getMessages());
  })

  // Eliminamos el mensaje de la db
  socket.on('deleteMessage', async (messageId) => {
    await chatHandling.deleteMessage(messageId);
    socketServer.emit('mensajes', await chatHandling.getMessages());
  })

});

export default socketServer;