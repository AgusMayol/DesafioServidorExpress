import express from "express";
import ProductManager from './classes/ProductManager.js'

const app = express()

const productHandling = new ProductManager();

app.get('/products', async (req, res) => {
    const limit = req.query.limit; // Obtener el valor del query ?limit=
    const products = await productHandling.getProducts(limit)
    res.send(products)
})

app.get('/products/:pid', async (req, res) => {
    const productId = req.params.pid; // Obtener el ID del producto desde la URL: /products/2 ...
    const product = await productHandling.getProductById(productId)
    res.send(product)
})

app.listen(8080, () => { console.log("Servidor levantado en puerto :8080") })