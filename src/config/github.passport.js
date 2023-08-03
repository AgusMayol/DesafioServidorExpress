import passport from "passport";
import GithubStrategy from "passport-github2";
import { sessionModel } from "../daos/mongodb/models/sessions.model.js";
import { createHash } from "../utils.js";
import { uuid } from 'uuidv4';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } from "../config.js";

export const intializePassport = () => {
    passport.use(
        "github",
        new GithubStrategy(
            {
                clientID: GITHUB_CLIENT_ID,
                clientSecret: GITHUB_CLIENT_SECRET,
                callbackURL: GITHUB_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                console.log(profile)
                //Como no me provee un email, vamos a hacer que github añada el id en lugar de email.
                let user = await sessionModel.findOne({ email: profile.id });
                if (!user) {

                    let newUser = {
                        first_name: profile.username,
                        last_name: "",
                        email: profile.id,
                        age: 18,
                        password: createHash(uuid()), //Creamos un hash a partir de un UID generado
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