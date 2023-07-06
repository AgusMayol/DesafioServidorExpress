import { Router } from "express";
import { sessionModel } from "../daos/mongodb/models/sessions.model.js";

const router = Router();

router.post("/register", async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;
    const exist = await sessionModel.findOne({ email });

    if (exist)
        return res
            .status(400)
            .send({ status: "error", message: "usuario ya registrado" });

    let result = await sessionModel.create({
        first_name,
        last_name,
        email,
        age,
        password,
    });
    res.send({ status: "success", message: "usuario  registrado" });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)
    const user = await sessionModel.findOne({ email: email, password: password });
    console.log(user)
    if (!user) return res.redirect('/api/login')
    req.session.user = {
        name: user.first_name + " " + user.last_name,
        email: user.email,
        age: user.age,
        level: user.level
    };
    res.send({ status: "success", message: req.session.user });
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir la sesión:', err);
        } else {
            res.clearCookie('connect.sid'); // Eliminar la cookie de sesión
            res.redirect('/login');
        }
    });

    res.redirect('/login');
});


export default router