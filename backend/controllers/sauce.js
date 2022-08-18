const auth = require('../middleware/auth');
const fs = require('fs');

const Sauce = require('../models/sauce');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: parseInt(0),
        dislikes: parseInt(0),
        usersLiked: [],
        usersDisliked: []
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce saved!' }) })
        .catch(error => { res.status(400).json({ error }) });
};

exports.updateSauce = (req, res, next) => {
    const newSauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete newSauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: 'Unauthorized request' });
            } else {
                if (sauce.imageUrl) {
                    const originalFileName = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${originalFileName}`);
                }
                Sauce.updateOne({ _id: req.params.id }, { ...newSauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce updated!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(401).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Unauthorized' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce deleted!' }))
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            switch (req.body.like) {
                case parseInt(1):
                    if (!(sauce.usersLiked.includes(req.body.userId)) && !(sauce.usersDisliked.includes(req.body.userId))) {
                        sauce.likes++;
                        sauce.usersLiked.push(req.body.userId);
                    }
                    break;
                case parseInt(-1):
                    if (!(sauce.usersDisliked.includes(req.body.userId)) && !(sauce.usersLiked.includes(req.body.userId))) {
                        sauce.dislikes++;
                        sauce.usersDisliked.push(req.body.userId);
                    }
                    break;
                case parseInt(0):
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        const userIndex = sauce.usersLiked.findIndex(id => id == req.body.userId);
                        sauce.usersLiked.splice(userIndex, 1);
                        sauce.likes--;
                    }
                    if (sauce.usersDisliked.includes(req.body.userId)) {
                        const userIndex = sauce.usersDisliked.findIndex(id => id == req.body.userId);
                        sauce.usersDisliked.splice(userIndex, 1);
                        sauce.dislikes--;
                    }
                    break;
                default:
                    return sauce;
                }
            Sauce.updateOne({ _id: req.params.id }, sauce)
                .then(() => res.status(200).json({ message: 'Sauce updated!' }))
                .catch(error => res.status(401).json({ error }));
            }
        )
        .catch(error => res.status(500).json({ error }));
}