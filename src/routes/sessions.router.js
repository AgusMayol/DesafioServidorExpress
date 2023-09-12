import { Router } from "express";
import { createHash, isValidPassword } from "../utils.js";
import { resetPasswordModel } from "../daos/mongodb/models/resetPassword.model.js";
import { sessionModel } from "../daos/mongodb/models/sessions.model.js";
import { cartModel } from "../daos/mongodb/models/carts.model.js";
import { sendEmail } from "../mail.js";
import { PORT } from "../config.js";
import errors from "../errors.json" assert { type: 'json' };
import passport from "passport";

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

router.get("/requestRestartPassword/:email", async (req, res) => {
    console.log("Request initiated")
    try {
        const email = req.params.email;
        if (!email) return res.status(400).send({ status: "error", error: "Incomplete Values" });

        const user = await sessionModel.findOne({ email });
        console.log(user)
        if (!user) return res.send({ status: "success" }); //Sin codigo de error, cancelamos la operación discretamente.

        let resetPassword = await resetPasswordModel.create({ userID: user._id, isValid: true });
        console.log(resetPassword)

        sendEmail(email, "Password reset", `Hello ${user.first_name}, follow the link below to recover your password.`, `<a href="http://localhost:${PORT}/resetPassword/${user._id}/${resetPassword._id}/${resetPassword.code}">Reset password</a>`)

        res.send({ status: "success", message: "Password reset sent successfully to your email" });

    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

router.post("/restartPassword/:rpid", async (req, res) => {
    try {
        let resetPasswordId = req.params.rpid;
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).send({ status: "error", error: "Incomplete Values" });

        const user = await sessionModel.findOne({ email });

        if (!user) return res.status(404).send({ status: "error", error: "User not found" });

        const newHashedPassword = createHash(password);

        if (newHashedPassword == user.password) return res.status(400).send({ status: "error", error: "Password cannot be the same" });

        await sessionModel.updateOne(
            { _id: user._id },
            { $set: { password: newHashedPassword } }
        );

        await resetPasswordModel.deleteOne({ _id: resetPasswordId });

        res.send({ status: "success", message: "Contraseña restaurada" });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

router.post("/premium/:uid", async (req, res) => {
    try {
        const id = req.params.uid;

        if (!req.session.user) return res.status(401).send(errors.login);
        if (req.session.user.level < 1) return res.status(401).send(errors.lowPerms);

        const user = await sessionModel.findOne({ _id: id });

        if (!user) return res.status(404).send({ status: "error", error: "User not found" });

        if (user.premium) {
            user.premium = false;
        } else {
            user.premium = true;
        }

        user.save();

        res.send({ status: "success", message: "Usuario actualizado" });
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
    if (!req.session.user) return res.status(401).send(errors.login);
    res.send(req.session.user);
}
);

export default router