import { Router } from "express";
import { sessionModel } from "../daos/mongodb/models/sessions.model.js";
import passport from "passport";
import { createHash, isValidPassword } from "../utils.js";

const router = Router();

router.post("/register", async (req, res) => {
    let { first_name, last_name, email, age, password } = req.body;
    const exist = await sessionModel.findOne({ email });

    if (exist) return res.status(400).send({ status: "error", message: "usuario ya registrado" });

    password = createHash(password);

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
    const user = await sessionModel.findOne({ email: email });
    if (!user) return res.redirect('/api/login')
    if (!isValidPassword(password, user.password)) return res.redirect('/api/login')

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

router.post("/restartPassword", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).send({ status: "error", error: "Incomplete Values" });

    const user = await sessionModel.findOne({ email });

    if (!user) return res.status(404).send({ status: "error", error: "Not user found" });

    const newHashedPassword = createHash(password);

    await sessionModel.updateOne(
        { _id: user._id },
        { $set: { password: newHashedPassword } }
    );
    res.send({ status: "success", message: "Contraseña restaurada" });
});

router.get(
    "/github",
    passport.authenticate("github", { scope: "user:email" }),
    (req, res) => {
    }
);

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
    console.log('exito')
    console.log(req.user)

    req.session.user = {
        name: req.user.first_name,
        email: req.user.email,
        age: req.user.age,
        level: req.user.level
    };

    res.redirect('/')
})



export default router