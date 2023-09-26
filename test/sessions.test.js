import chai from "chai";
import supertest from "supertest";
import '../src/server.js'
import { PORT } from "../src/config.js";

const expect = chai.expect;
const requester = supertest(`http://localhost:${PORT}`);

describe("test sessions router", () => {

    let cookie;
    let userID;

    it("POST /api/sessions/register debe crear un usuario", async () => {
        const mockUser = {
            first_name: 'Carlos',
            last_name: 'Fernandez',
            email: 'carlos.f@email.com',
            age: 30,
            password: 'password123',
        };
        const result = await requester
            .post("/api/sessions/register")
            .send(mockUser);
        expect(result.body.payload).to.be.ok;
    }).timeout(10000);

    it("POST /api/sessions/login logear un usuario", async () => {
        const mockUser = {
            email: "carlos.f@email.com",
            password: "password123",
        };
        const result = await requester.post("/api/sessions/login").send(mockUser);
        const cookieResult = result.headers["set-cookie"][0];
        expect(cookieResult).to.be.ok;
        cookie = {
            name: cookieResult.split("=")[0],
            value: cookieResult.split("=")[1],
        };
    }).timeout(1000);

    it("GET api/sessions/current obtiene info del usuario actual", async () => {
        const result = await requester
            .get("/api/sessions/current")
            .set("Cookie", [`${cookie.name}=${cookie.value}`]);
        expect(result.body.name).to.be.ok
        userID = result.body.userId
    });

    it("DELETE api/sessions/delete/:id elimina el usuario actual", async () => {
        const deleteUser = await requester
            .delete(`/api/sessions/delete/${userID}`)
            .set("Cookie", [`${cookie.name}=${cookie.value}`]);
        expect(deleteUser.body.payload).to.be.ok;
    });

});