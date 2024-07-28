import * as db from '../models.js';
import * as utils from '../utils.js';

const { Op } = db.Sequelize;

const createPlayer = (req, res) => {
  const body = {};

  if (req.body.name) {
    body.name = req.body.name;
  } else {
    res.status(500).send({
      message: '`name` cannot be empty',
    });
  }

  if (req.body.title) {
    if (['WCM', 'WFM', 'WIM', 'WGM', 'CM', 'FM', 'IM', 'GM'].includes(req.body.title)) {
      body.title = req.body.title;
    } else {
      res.status(500).send({
        message: 'Invalid title',
      });
    }
  }

  if (req.body.urls) {
    if (Object.values(req.body.urls).map((i) => !utils.isValidUrl(i)).reduce((a, b) => a + b)) {
      res.status(500).send({
        message: 'Invalid urls. Must be JSON formatted map of string to url.',
      });
    } else {
      body.urls = req.body.urls;
    }
  } else {
    body.urls = {};
  }

  db.Player.create(body).then(
    (data) => res.send(data),
  ).catch((err) => {
    res.status(500).send({
      message:
                    err.message || 'Some error occurred when creating the Player.',
    });
  });
};

const updatePlayer = (req, res) => {
  const { id } = req.params;

  const body = {};

  if (req.body.name) {
    body.name = req.body.name;
  }

  if (req.body.title) {
    if (['WCM', 'WFM', 'WIM', 'WGM', 'CM', 'FM', 'IM', 'GM'].includes(req.body.title)) {
      body.title = req.body.title;
    } else if (req.body.title === 'None') {
      body.title = null;
    } else {
      res.status(500).send({
        id,
        status: 'fail',
        message: 'Invalid title',
      });
      return;
    }
  }

  if (req.body.urls) {
    try {
      if (Object.values(req.body.urls).map((i) => !utils.isValidUrl(i)).reduce((a, b) => a + b)) {
        res.status(500).send({
          id,
          status: 'fail',
          message: 'Invalid urls. Must be JSON formatted map of string to url.',
        });
        return;
      }
      body.urls = req.body.urls;
    } catch (err) {
      res.status(500).send({
        id,
        status: 'fail',
        message: 'Invalid urls. Must be JSON formatted.',
      });
      return;
    }
  }

  db.Player.update(body, {
    where: { id },
  }).then((num) => {
    if (num[0] === 1) {
      res.send({
        id,
        status: 'success',
      });
    } else {
      res.send({
        id,
        status: 'fail',
      });
    }
  }).catch((err) => {
    res.status(500).send({
      id,
      status: 'error',
    });
  });
};

const deletePlayer = (req, res) => {
  const { id } = req.params;

  db.Player.destroy({
    where: { id },
  })
    .then((num) => {
      if (num === 1) {
        res.send({
          id,
          status: 'success',
        });
      } else {
        res.status(500).send({
          id,
          status: 'failed',
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        id,
        status: 'failed',
      });
    });
};

const findPlayers = (req, res) => {
  let where = null;
  if (req.query.name && req.query.title) {
    where = { name: { [Op.like]: `%${req.query.name}%` }, title: req.query.title };
  } else if (req.query.name) {
    where = { name: { [Op.like]: `%${req.query.name}%` } };
  } else if (req.query.title) {
    where = { title: req.query.title };
  }

  db.Player.findAll({
    attributes: ['id', 'name', 'title', 'urls'],
    where,
    order: [['id', 'ASC']],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        status: 'error',
      });
    });
};

const getPlayer = (req, res) => {
  const { id } = req.params;

  db.Player.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Player with id ${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error retrieving Player with id ${id}`,
      });
    });
};

export {
  createPlayer,
  updatePlayer,
  deletePlayer,
  findPlayers,
  getPlayer,
};
