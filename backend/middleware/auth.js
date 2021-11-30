const jwt = require('jsonwebtoken');
require('dotenv').config();

// validation of the userID in comparison with the token
module.exports = (req, res, next) => {

    // Numerous problems can happen, we inser everything in the bloc "try...catch"
    try {

        // we extract the token from the header "Authorization"
        // split" will recover everything after the space in the header
        const token = req.headers.authorization.split(' ')[1];

        // "verify" will decode our token
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);

        // we extract userID of our token
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw 'User ID non valable !';
        } else {
            next();
        }
    } catch {
        res.status(401).json({
            error: new Error('Requête non authentifiée !')
        });
    }
};