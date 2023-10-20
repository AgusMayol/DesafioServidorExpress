import passport from "passport";
import GithubStrategy from "passport-github2";
import { sessionModel } from "../daos/mongodb/models/sessions.model.js";
import { cartModel } from "../daos/mongodb/models/carts.model.js";
import { createHash, currentDate } from "../utils.js";
import { v4 } from 'uuid';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL, URL } from "../config.js";

export const intializePassport = () => {
    passport.use(
        "github",
        new GithubStrategy(
            {
                clientID: GITHUB_CLIENT_ID,
                clientSecret: GITHUB_CLIENT_SECRET,
                callbackURL: URL + GITHUB_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                //Como no me provee un email, vamos a hacer que github añada el id en lugar de email.
                let user = await sessionModel.findOne({ email: profile.id });

                let response = await cartModel.create({ products: [] });
                let cartId = response._id;
                if (!user) {

                    let newUser = {
                        first_name: profile.username,
                        last_name: "",
                        email: profile.id,
                        age: 18,
                        password: createHash(v4()), //Creamos un hash a partir de un UID generado,
                        cartId,
                        last_connection: currentDate()
                    };
                    const result = await sessionModel.create(newUser);
                    done(null, result);
                } else {
                    done(null, user);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await sessionModel.findById(id);
        done(null, user);
    });
};