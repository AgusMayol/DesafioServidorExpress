import passport from "passport";
import GithubStrategy from "passport-github2";
import { sessionModel } from "../daos/mongodb/models/sessions.model.js";
import { createHash } from "../utils.js";
import { uuid } from 'uuidv4';

export const intializePassport = () => {
    passport.use(
        "github",
        new GithubStrategy(
            {
                clientID: "25a9591e02eaca86e754",
                clientSecret: "1f36de1c7f15ba1ccb46a858adba7155a47410c0",
                callbackURL: "http://localhost:8080/api/sessions/githubcallback",
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