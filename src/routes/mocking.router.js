import { Router } from "express";
const router = Router();
import { faker } from '@faker-js/faker';
import { sendEmail } from "../mail.js";
//GET

//Crear productos con Faker.js
router.get("/mockingproducts", async (req, res) => {
    let limit = Number(req.query.limit) || 100;

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
});

router.get("/sendmail", async (req, res) => {
    sendEmail("agusmayolitos@gmail.com", "[TEST] Thanks for your purchase!", `you have purchased <number> items in our store!`)

    res.send({ status: "success" });
});



export default router;