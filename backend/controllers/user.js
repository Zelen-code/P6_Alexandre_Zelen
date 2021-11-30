const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// registration of new users
exports.signup = (req, res, next) => {
    // we call thez function of hash of bcrypt in our password and ask to "salt" 10 times
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                // we create an user and record him in the database
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

// we look for one user in the database
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            // if we don't find the user
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            // we compare the entered password with the recorded hash in the database
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    // if the 2 passwords correspond, we send back a response 200 containing the user ID and one token
                    res.status(200).json({
                        userId: user._id,
                        // the function "sign" uses a secret key to encode a new token
                        // this JSON web token contains user ID as a payload (encoded data in the token)
                        token: jwt.sign({ userId: user._id },
                            // we use a secret string to encode our token
                            process.env.SECRET_TOKEN,
                            // validity of the token, the user will have to reconnect after 24h
                            { expiresIn: '24h' })
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};