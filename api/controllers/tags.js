import * as db from '../models.js';

const { Op } = db.Sequelize;

const createTag = (req, res) => {
  if (req.body.name) {
    db.Tag.create({ name: req.body.name }).then(
      (data) => res.send(data),
    ).catch((err) => {
      res.status(500).send({
        status: 'error',
      });
    });
  } else {
    res.status(400).send({
      status: 'failed',
      message: '`name` cannot be empty!',
    });
  }
};

const deleteTag = (req, res) => {
  const { id } = req.params;

  db.Tag.destroy({
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

const findTags = (req, res) => {
  let where = null;
  if (req.query.name) {
    where = { name: { [Op.like]: `%${req.query.name}%` } };
  }
  db.Tag.findAll({
    attributes: ['id', 'name'],
    where,
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

const getTag = (req, res) => {
  const { id } = req.params;

  db.Tag.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          id,
          status: 'failed',
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        id,
        status: 'error',
      });
    });
};

export {
  createTag,
  deleteTag,
  findTags,
  getTag,
};
