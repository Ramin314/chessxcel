import * as db from '../models.js';

const updatePosition = async (req, res) => {
  const { fen } = req.params;

  try {
    if (req.body.meta && typeof req.body.meta === 'object') {
      await db.Position.update({ meta: req.body.meta }, {
        where: { fen },
      }).then((num) => {
        if (num[0] === 1) {
          res.send({
            fen,
            status: 'success',
          });
        } else {
          res.send({
            fen,
            status: 'failed',
          });
        }
      }).catch((err) => {
        res.status(500).send({
          fen,
          status: 'error',
        });
      });
    }
    if (req.body.tags) {
      await db.Game.findOne({ fen }).then((data) => data.setTags(req.body.tags));
    }
    res.send({
      fen,
      status: 'success',
    });
  } catch (err) {
    res.status(500).send({
      fen,
      status: 'error',
    });
  }
};

const findPositions = (req, res) => {
  const filters = {};

  if (req.query.tags) {
    filters.attributes = { exclude: ['tags'], include: filters.attributes };
    filters.distinct = true;
    filters.group = ['position.id'];
    filters.having = db.Sequelize.literal(`COUNT(DISTINCT \`tags\`.\`id\`) = ${req.query.tags.split(',').length}`);
    filters.include.push({
      model: db.Tag,
      as: 'tags',
      where: {
        id: req.query.tags.split(','),
      },
      attributes: [],
      through: { attributes: [] },
    });
  }

  const MAX_PER_PAGE = 50;

  filters.limit = Math.min(parseInt(req.query.perPage || MAX_PER_PAGE, 10), MAX_PER_PAGE);
  filters.offset = (Math.max(parseInt(req.query.page || 0, 10), 1) - 1) * filters.limit;
  filters.subQuery = false;

  db.Position.findAll(filters)
    .then((positions) => {
      const positionsWithoutTags = positions.map((position) => {
        const { tags, ...positionWithoutTags } = position.toJSON();
        return positionWithoutTags;
      });
      return positionsWithoutTags;
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

const getPosition = (req, res) => {
  const { fen } = req.params;

  db.Position.findOne({
    where: { fen },
  }).then((data) => {
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        fen,
        status: 'error',
      });
    }
  })
    .catch((err) => {
      res.status(500).send({
        fen,
        status: 'error',
      });
    });
};

export {
  updatePosition,
  findPositions,
  getPosition,
};
