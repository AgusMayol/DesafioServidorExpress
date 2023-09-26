import chai from "chai";
import supertest from "supertest";
import '../src/server.js'
import { PORT } from "../src/config.js";

const expect = chai.expect;
const requester = supertest(`http://localhost:${PORT}`);

describe("test cart router", () => {

    it("GET /api/cart/ debe obtener todos los carritos", async () => {
        const result = await requester
            .get("/api/cart/")
        expect(result.body).to.be.ok;
    }).timeout(10000);

    it("GET /api/cart/:cid debe obtener un solo carrito", async () => {
        const mockId = "64bddc4936af337d13279452"
        const result = await requester.get(`/api/cart/${mockId}`);
        expect(result.body).to.be.ok;
    }).timeout(1000);

});