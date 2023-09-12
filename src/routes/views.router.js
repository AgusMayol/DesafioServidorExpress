import { Router } from "express";
const router = Router();
import { productHandling, cartHandling } from "../server.js";
import { resetPasswordModel } from "../daos/mongodb/models/resetPassword.model.js";
import { TicketModel } from "../daos/mongodb/models/ticket.model.js";
import errors from "../errors.json" assert { type: 'json' };
import moment from 'moment';

router.get('/', async (req, res) => {
    try {
        let limit = Number(req.query.limit) || undefined;
        let page = Number(req.query.page) || undefined;
        let sort = Number(req.query.sort) || undefined;
        let queryType = req.query.queryType || undefined;
        let queryValue = req.query.queryValue || undefined;

        const products = await productHandling.getProducts(limit, page, sort, queryType, queryValue);
        res.render('home', { title: "Productos", products: products, user: req.session.user });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
})

router.get('/product/:pid', async (req, res) => {
    try {
        const id = req.params.pid;
        const product = await productHandling.getProductById(id);

        res.render('product', { title: "Producto", product: product, user: req.session.user });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
})

router.get('/carts', async (req, res) => {
    try {
        let carts = await cartHandling.getCarts();
        res.render('carts', { title: "Carritos", carts: carts, user: req.session.user });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
})

router.get('/realtimeproducts', async (req, res) => {

    if (!req.session.user) return res.redirect('/login');

    let nivel = req.session.user.level || 0;

    if (nivel < 1 || req.session.user.premium == false) return res.status(401).send(errors.lowPerms);

    res.render('realTimeProducts', { title: "Productos en Tiempo Real", user: req.session.user })
});

router.get('/chat', async (req, res) => {

    if (!req.session.user) return res.redirect('/login');

    res.render('chat', { title: "Chat", user: req.session.user })
});

router.get('/register', (req, res) => {
    res.render('register');
})

router.get('/login', (req, res) => {
    res.render('login');
})

router.get('/requestRestartPassword', (req, res) => {
    res.render('requestRestartPassword');
})

router.get('/resetPassword/:uid/:rpid/:code', async (req, res) => {
    let userId = req.params.uid;
    let resetPasswordId = req.params.rpid;
    let code = req.params.code;

    let requestRestartPassword = await resetPasswordModel.findOne({ _id: resetPasswordId, userID: userId, code: code });
    if (!requestRestartPassword) return res.redirect('/requestRestartPassword');


    // Obtener la fecha actual
    const currentTime = moment();
    const createdAt = moment(requestRestartPassword.createdAt);

    // Calcular la diferencia en horas entre la fecha actual y la fecha de creación
    const hoursDifference = currentTime.diff(createdAt, 'hours');

    if (hoursDifference >= 1) {
        return res.redirect('/requestRestartPassword');
    }

    res.render('resetPassword');
})

router.get('/ticket/:tid', async (req, res) => {
    try {
        let ticketId = req.params.tid;

        if (!ticketId) {
            res.redirect('/');
        }

        let ticket = await TicketModel.findOne({ _id: ticketId }).lean();
        res.render('ticket', { title: "Resumen de compra", user: req.session.user, ticket: ticket })
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
})


export default router;