import { Router } from "express";
const router = Router();
import { faker } from '@faker-js/faker';
import { sendEmail } from "../mail.js";
//GET

//Crear productos con Faker.js
router.get("/mockingproducts", async (req, res) => {
    try {
        let limit = Number(req.query.limit) || 100;

        if (!req.session.user) return res.status(401).send({ status: "error", message: "Unauthorized, please log in." });
        if (req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, you must be an admin." });

        let products = [];

        for (var i = 0; i < limit; i++) {
            let product = {
                _id: faker.string.alpha({ length: { min: 24, max: 24 } }),
                title: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                code: faker.string.alpha({ length: { min: 5, max: 10 } }),
                category: faker.commerce.department(),
                price: faker.number.int({ min: 100, max: 1000 }),
                thumbnail: faker.image.url(),
                stock: faker.number.int({ min: 10, max: 1000 }),
                id: faker.string.alpha({ length: { min: 24, max: 24 } }),
            };
            products.push(product)
        }

        res.send(products);
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

router.get("/sendmail", async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).send({ status: "error", message: "Unauthorized, please log in." });
        if (req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, you must be an admin." });

        sendEmail("agusmayolitos@gmail.com", "[TEST] Thanks for your purchase!", `you have purchased <number> items in our store!`)

        res.send({ status: "success" });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});


router.get("/loggerTest", (req, res) => {
    try {
        if (!req.session.user) return res.status(401).send({ status: "error", message: "Unauthorized, please log in." });
        if (req.session.user.level < 1) return res.status(401).send({ status: "error", message: "Unauthorized, you must be an admin." });

        req.logger.error('[ERROR TEST] - Success');
        req.logger.warn('[WARN TEST] - Success');
        req.logger.info('[INFO TEST] - Success');
        req.logger.http('[HTTP TEST] - Success');
        req.logger.verbose('[VERBOSE TEST] - Success');
        req.logger.debug('[DEBUG TEST] - Success');
        req.logger.silly('[SILLY TEST] - Success');
        res.send({ message: "Se hizo una prueba del logger." });

    } catch (error) {

        try {
            req.logger.error(error);
        } catch (error) {
            console.log("Hay un error con winston logger: ", error)
        }

        return res.send(error);
    }
});


export default router;