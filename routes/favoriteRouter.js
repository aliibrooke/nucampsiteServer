const express = require('express');
const Favorite = require('../models/favorites');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorites) => {
        if (favorites) {
          Favorite.findById(favorites._id)
            .populate("campsites")
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({ campsites: favorite.campsites });
            });
        } else {
          err = new Error(`Favorites not found.`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorites) => {
        if (favorites) {
          req.body.forEach((faves) => {
            if (!favorites.campsites.includes(faves._id)) {
              favorites.campsites.push(faves._id);
            }
          });
          favorites
            .save()
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        } else {
          Favorite.create({ user: req.user._id })
            .then((favorites) => {
                req.body.forEach((faves) => {
                    if (!favorites.campsites.includes(faves._id)) {
                      favorites.campsites.push(faves._id);
                }
            });
              favorites
                .save()
                .then((favorites) => {
                  Favorite.findById(favorites._id)
                    .populate("user")
                    .populate("campsites")
                    .then((favorites) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorites);
                    });
                })
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.deleteMany()
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });

favoriteRouter.route('/:campsiteId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.favoriteId}`);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorites) => {
        if (favorites) {
          req.body.forEach((faves) => {
            if (!favorites.campsites.includes(req.params.campsiteId)) {
              favorites.campsites.push(req.params.campsiteId);
            }
          });
          favorites
            .save()
            .then((favorite) => {
              Favorite.findById(favorites._id)
                .populate("user")
                .populate("campsites");
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        } else {
          Favorite.create({ user: req.user._id })
            .then((favorites) => {
              favorites.campsites.push(req.params.campsiteId);
              favorites
                .save()
                .then((favorites) => {
                  Favorite.findById(favorites._id)
                    .populate("user")
                    .populate("campsites")
                    .then((favorites) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorites);
                    });
                })
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /favorites/${req.params.favoriteId}`
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findByIdAndDelete(req.params.favoriteId)
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;