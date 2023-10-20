import { Router } from "express";
import __dirname, { createHash, isValidPassword, currentDate } from "../utils.js";
import { resetPasswordModel } from "../daos/mongodb/models/resetPassword.model.js";
import { sessionModel } from "../daos/mongodb/models/sessions.model.js";
import { cartModel } from "../daos/mongodb/models/carts.model.js";
import { sendEmail } from "../mail.js";
import { PORT, URL } from "../config.js";
import errors from "../errors.json" assert { type: 'json' };
import passport from "passport";
import multer from "multer";
import { v4 } from 'uuid';

const documents = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${__dirname}/uploads/documents`);
    },
    filename: (req, file, cb) => {
        const randomUuid = v4();
        const fileName = randomUuid + file.originalname;

        cb(null, fileName);
    }
});

const profiles = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${__dirname}/uploads/profiles`);
    },
    filename: (req, file, cb) => {
        const randomUuid = v4();
        const fileName = randomUuid + file.originalname;

        cb(null, fileName);
    }
});

const uploadDocuments = multer({ storage: documents });
const uploadProfiles = multer({ storage: profiles });

const router = Router();

router.get("/", async (req, res) => {
    if (!req.session.user) return res.status(401).send(errors.login);
    if (req.session.user.level < 1) return res.status(401).send(errors.lowPerms);

    const result = await sessionModel.find({}).select('-password');

    res.send(result);
});

router.delete("/", async (req, res) => {
    if (!req.session.user) return res.status(401).send(errors.login);
    if (req.session.user.level < 1) return res.status(401).send(errors.lowPerms);

    const users = await sessionModel.find({ last_connection: { $lt: currentDate() } }).select('-password');
    let fechaActual = currentDate().substring(8, 10);

    let usuariosEliminados = [];

    for (const user of users) {
        let ultimaConexion = user.last_connection.substring(8, 10)
        if ((fechaActual - ultimaConexion) > 2)
            await sessionModel.deleteOne({ _id: user._id });
        sendEmail(user.email, "Your account has been deleted", `Hello ${user.first_name}, your account has been removed from our e-commerce because inactivity. If you would like to recover it, please create a new one`, `<a href="${URL}/register">here</a>`)
        usuariosEliminados.push(user);
    }

    res.send({ status: "success", message: "Usuarios eliminados y notificados", payload: usuariosEliminados });
});

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
        cartId,
        last_connection: currentDate()
    });
    res.send({ status: "success", message: "usuario registrado", payload: result._id });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await sessionModel.findOne({ email: email });
    if (!user) return res.redirect('/login')
    if (!isValidPassword(password, user.password)) return res.redirect('/login')

    const result = await sessionModel.updateOne({ email: email }, { $set: { last_connection: currentDate() } });

    req.session.user = {
        name: user.first_name + " " + user.last_name,
        email: user.email,
        age: user.age,
        level: user.level,
        cartId: user.cartId,
        userId: user._id
    }

    res.send({ status: "success", message: req.session.user });
});

router.get("/logout", async (req, res) => {
    try {
        if (req.session.user) {

            const user = await sessionModel.findOne({ _id: req.session.UserId });
            const result = await sessionModel.updateOne({ _id: req.session.UserId }, { $set: { last_connection: currentDate() } });

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

router.delete("/delete/:id", async (req, res) => {
    try {
        let userID = req.params.id;
        if (req.session.user.userId == userID) {
            req.session.destroy(async (err) => {
                if (err) {
                    log.error("Error al destruir la sesión: ", err)
                    return res.status(500).send({ status: "error", message: "Error al cerrar sesión" });
                }

                let result = await sessionModel.deleteOne({ _id: userID });
                return res.send({ status: "success", message: "Sesión cerrada y usuario eliminado correctamente", payload: result });
            });
        }

        else {
            return res.send({ status: "error", message: "No se encontró sesión activa" });
        }
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

router.get("/requestRestartPassword/:email", async (req, res) => {
    try {
        const email = req.params.email;
        if (!email) return res.status(400).send({ status: "error", error: "Incomplete Values" });

        const user = await sessionModel.findOne({ email });
        if (!user) return res.send({ status: "success" }); //Sin codigo de error, cancelamos la operación discretamente.

        let resetPassword = await resetPasswordModel.create({ userID: user._id, isValid: true });

        sendEmail(email, "Password reset", `Hello ${user.first_name}, follow the link below to recover your password.`, `<a href="${URL}/resetPassword/${user._id}/${resetPassword._id}/${resetPassword.code}">Reset password</a>`)

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
            if (user.documentsUploaded < 3) return res.status(400).send({ status: "error", error: "No se han subido los documentos necesarios para ser usuario premuim" });
            user.premium = true;
        }

        user.save();

        res.send({ status: "success", message: "Usuario actualizado" });
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

router.post("/:uid/documents", uploadDocuments.array('archivos', 3), async (req, res) => {
    try {
        const id = req.params.uid;

        if (!req.session.user) return res.status(401).send(errors.login);

        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No se ha seleccionado ningún archivo.');
        }

        if (req.files.length > 3) {
            return res.status(400).send('Se ha superado la cantidad máxima de archivos permitidos');
        }

        const user = await sessionModel.findOne({ _id: id });

        if (!user) return res.status(404).send({ status: "error", error: "User not found" });

        user.documentsUploaded = req.files.length + user.documentsUploaded;

        for (const file of req.files) {
            const archivo = { name: file.filename, reference: file.path }
            user.documents.push(archivo);
        }
        user.save();

        res.status(200).send('Se han subido los archivos correctamente.');
    } catch (error) {
        req.logger.error(error);
        return res.send(error);
    }
});

router.post("/:uid/profiles", uploadProfiles.single('avatar'), async (req, res) => {
    try {
        const id = req.params.uid;

        if (!req.session.user) return res.status(401).send(errors.login);

        if (!req.file || req.file.length === 0) {
            return res.status(400).send('No se ha seleccionado ningún archivo.');
        }

        const user = await sessionModel.findOne({ _id: id });

        if (!user) return res.status(404).send({ status: "error", error: "User not found" });

        user.avatar = req.file.filename;
        user.save();

        res.status(200).send('Se han subido los archivos correctamente.');
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