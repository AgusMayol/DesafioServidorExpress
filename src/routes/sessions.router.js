import { Router } from "express";
import { sessionModel } from "../daos/mongodb/models/sessions.model.js";
import passport from "passport";
import { createHash, isValidPassword } from "../utils.js";
import { cartModel } from "../daos/mongodb/models/carts.model.js";

const router = Router();

router.post("/register", async (req, res) => {
    let { first_name, last_name, email, age, password } = req.body;
    const exist = await sessionModel.findOne({ email });

    if (exist) return res.status(400).send({ status: "error", message: "usuario ya registrado" });

    password = createHash(password);

    let response = await cartModel.create({ products: [] });
    let cartId = response._id;

    let result = await sessionModel.create({
        first_name,
        last_name,
        email,
        age,
        password,
        cartId
    });
    res.send({ status: "success", message: "usuario  registrado" });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await sessionModel.findOne({ email: email });
    if (!user) return res.redirect('/login')
    if (!isValidPassword(password, user.password)) return res.redirect('/login')

    req.session.user = {
        name: user.first_name + " " + user.last_name,
        email: user.email,
        age: user.age,
        level: user.level,
        cartId: user.cartId
    }

    res.send({ status: "success", message: req.session.user });
});

router.get("/logout", (req, res) => {
    try {
        if (req.session.user) {
            req.session.destroy((err) => {
                if (err) {
                    log.error("Error al destruir la sesión: ", err)
                    return res.status(500).send({ status: "error", message: "Error al cerrar sesión" });
                }
                return res.send({ status: "success", message: "Sesión cerrada correctamente" });
            });
        } else {
            return res.send({ status: "success", message: "No se encontró sesión activa" });
        }
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});


router.post("/restartPassword", async (req, res) => {
    try {
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
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

router.get(
    "/github",
    passport.authenticate("github", { scope: "user:email" }),
    (req, res) => {
    }
);

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {

    req.session.user = {
        name: req.user.first_name,
        email: req.user.email,
        age: req.user.age,
        level: req.user.level
    };

    res.redirect('/')
})

router.get("/current", async (req, res) => {
    if (!req.session.user) return res.status(401).send({ status: "error", message: "Unauthorized" });
    res.send(req.session.user);
}
);

export default router