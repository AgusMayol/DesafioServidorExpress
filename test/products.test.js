import chai from "chai";
import supertest from "supertest";
import '../src/server.js'
import { PORT } from "../src/config.js";

const expect = chai.expect;
const requester = supertest(`http://localhost:${PORT}`);

describe("test products router", () => {

    it("GET /api/products/ debe obtener todos los productos", async () => {
        const result = await requester
            .get("/api/products/")
        expect(result.body).to.be.ok;
    }).timeout(10000);

    it("GET /api/products/:pid debe obtener un solo producto", async () => {
        const mockId = "648f843a21afbed6fd55ef40"
        const result = await requester.get(`/api/products/${mockId}`);
        expect(result.body).to.be.ok;
    }).timeout(1000);

});