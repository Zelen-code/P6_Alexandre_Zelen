// Logique métier
const Sauce = require('../models/Sauce');
// Récupération du module 'file system' de Node
const fs = require('fs');
// Création d'une sauce (Post)
exports.createSauce = (req, res, _next) => {
    // Extraire l'objet JSON de "sauce"
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    // Création d'un nouvel objet "Sauce"
    const sauce = new Sauce({
        ...sauceObject,
        // Générer l'URL de l'image : {protocol : http ou https}
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    // registration of the object Sauce in the database
    sauce.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, _next) => {

    // ternary operator
    const sauceObject = req.file ?

        // Check if one image already exists
        {
            ...JSON.parse(req.body.sauce),

            // "://" allows "req.protocol" and "req.get" connection
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };

    // if there is no image
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
};

// delete one sauce
exports.deleteSauce = (req, res, next) => {

    // we use the ID that we receive as a paramater to access to "Sauce" corresponding in the database
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {

            // recovery of the name of the file
            const filename = sauce.imageUrl.split('/images/')[1];

            // we erase the file
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// reading of one sauce with his ID (get/:id)
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// Lecture des sauces dans la base de donnée (Get)
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// Création d'un like ou dislike.
exports.likeSauce = (req, res, next) => {

    if (req.body.like === 1) {
        // Si l'utilisateur aime la sauce, on ajoute 1 et on l'envoie au tableau "usersLiked".
        // $inc est un opérateur utilisé pour augmenter le champ de la valeur donnée.
        // $push ajoute des éléments dans un tableau.
        Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: req.body.like++ }, $push: { usersLiked: req.body.userId } })
            .then((_sauce) => res.status(200).json({ message: 'Like ajouté !' }))
            .catch(error => res.status(400).json({ error }));
    } else if (req.body.like === -1) {
        // Si l'utilisateur n'aime pas la sauce, on ajoute 1 et on l'envoie au tableau "usersDisliked"
        Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: (req.body.like++) * -1 }, $push: { usersDisliked: req.body.userId } })
            .then((_sauce) => res.status(200).json({ message: 'Dislike ajouté !' }))
            .catch(error => res.status(400).json({ error }));
    } else {
        // Lorque l'utilisateur enlève son like/dislike
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                // Si le tableau "usersLiked" contient le userId, on enlève 1 "like" du tableau "usersLiked"
                if (sauce.usersLiked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
                        .then((_sauce) => { res.status(200).json({ message: 'Like supprimé !' }) })
                        .catch(error => res.status(400).json({ error }))
                } else if (sauce.usersDisliked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
                        .then((_sauce) => { res.status(200).json({ message: 'Dislike supprimé !' }) })
                        .catch(error => res.status(400).json({ error }))
                }
            })
            .catch(error => res.status(400).json({ error }));
    }
};