import * as db from '../models.js';
import * as utils from '../utils.js';

const { Op } = db.Sequelize;

const createPlayerIfStringId = async (playerId) => {
  if (typeof playerId === 'string') {
    try {
      const newPlayer = await db.Player.create({ name: playerId });
      return newPlayer.id;
    } catch (err) {
      console.error('Error creating player:', err);
      throw new Error('Error creating player');
    }
  }
  return playerId;
};

const createTagsIfStringIds = async (tags, transaction) => {
  const tagIds = [];
  for (const tag of tags) {
    if (typeof tag === 'string') {
      const [tagCreate, created] = await db.Tag.findOrCreate({
        where: { name: tag },
        transaction,
      });
      tagIds.push(tagCreate.id);
    } else {
      tagIds.push(tag);
    }
  }
  return tagIds;
};

const createGame = async (req, res) => {
  const body = {};

  let fenArray;
  let nextMoves = [];

  try {
    const { fens, moves, numMoves } = utils.getPositions(req.body.moves);
    fenArray = fens;
    nextMoves = moves;
    body.moves = req.body.moves;
    body.numMoves = numMoves;
  } catch (error) {
    return res.status(500).send({
      status: 'failed',
      message: 'moves invalid. Must be formatted as a valid PGN.',
    });
  }

  if (req.body.datePlayed && !utils.isValidDate(req.body.datePlayed)) {
    return res.status(500).send({
      status: 'failed',
      message: 'datePlayed invalid. Must be formatted as yyyy-mm-dd.',
    });
  }

  if (!['white', 'black', 'draw'].includes(req.body.result)) {
    return res.status(500).send({
      status: 'failed',
      message: 'result invalid. Must be one of white, black, draw.',
    });
  }

  if (req.body.meta && typeof req.body.meta !== 'object') {
    return res.status(500).send({
      status: 'failed',
      message: 'meta invalid. Must be JSON formatted.',
    });
  }

  body.datePlayed = req.body.datePlayed;
  body.result = req.body.result;
  body.meta = req.body.meta || {};
  body.whitePlayerId = req.body.whitePlayerId;
  body.blackPlayerId = req.body.blackPlayerId;

  const transaction = await db.sequelize.transaction();
  try {
    const whitePlayerId = await createPlayerIfStringId(req.body.whitePlayerId);
    const blackPlayerId = await createPlayerIfStringId(req.body.blackPlayerId);

    body.whitePlayerId = whitePlayerId;
    body.blackPlayerId = blackPlayerId;

    if (req.body.tags && Array.isArray(req.body.tags)) {
      const tagIds = await createTagsIfStringIds(req.body.tags, transaction);
      body.tags = tagIds;
    }

    const data = await db.Game.create(body, { transaction });

    await data.setTags(body.tags, { transaction });

    const existingPositions = await db.Position.findAll({
      where: { fen: fenArray },
      transaction,
    });

    const existingFens = existingPositions.map((position) => position.fen);
    const newFens = fenArray.filter((fen) => !existingFens.includes(fen));

    const newPositions = await db.Position.bulkCreate(
      newFens.map((fen) => ({ fen })),
      { transaction },
    );

    const allPositions = [...existingPositions, ...newPositions];

    const positionIds = allPositions.map((position) => position.id);

    const resultFieldToUpdate = {
      white: 'gamesWonByWhite',
      black: 'gamesWonByBlack',
      draw: 'gamesDrawn',
    }[data.result];

    const updateQuery = `
      UPDATE positions
      SET ${resultFieldToUpdate} = ${resultFieldToUpdate} + 1
      WHERE id IN (${positionIds.join(',')});
    `;

    await db.sequelize.query(updateQuery, { transaction });

    const updateQueries = nextMoves.map((nextMove, index) => `
      UPDATE positions
      SET
      movesPlayed = JSON_ARRAY_APPEND(
          movesPlayed,
          '$',
          '${nextMove}'
        )
      WHERE id = ${positionIds[index]}
      AND NOT JSON_CONTAINS(movesPlayed, '"${nextMove}"');
    `);

    await Promise.all(
      updateQueries.map(async (q) => db.sequelize.query(q, { transaction })),
    );

    const insertQuery = `
      INSERT INTO Game_Positions (gameId, positionId)
      VALUES ${positionIds.map((positionId) => `(${data.id}, ${positionId})`).join(',')};
    `;

    await db.sequelize.query(insertQuery, { transaction });

    await transaction.commit();
    res.send(data);
  } catch (err) {
    console.error(err);
    await transaction.rollback();
    res.status(500).send({
      status: 'error',
      message: err.message || 'Some error occurred when creating the Game.',
    });
  }
};

const updateGame = async (req, res) => {
  const { id } = req.params;
  const body = {};

  if (req.body.datePlayed) {
    if (utils.isValidDate(req.body.datePlayed)) {
      body.datePlayed = req.body.datePlayed;
    } else {
      res.status(500).send({
        id,
        status: 'failed',
        message: 'datePlayed invalid. Must be formatted as yyy-mm-dd.',
      });
      return;
    }
  }

  if (req.body.result) {
    if (['white', 'black', 'draw'].includes(req.body.result)) {
      body.result = req.body.result;
    } else {
      res.status(500).send({
        id,
        status: 'failed',
        message: 'result invalid. Must be one of white, black, draw.',
      });
      return;
    }
  }

  if (req.body.meta) {
    if (req.body.meta && typeof req.body.meta === 'object') {
      body.meta = req.body.meta;
    } else {
      res.status(500).send({
        id,
        status: 'failed',
        message: 'meta invalid. Must be JSON formatted.',
      });
      return;
    }
  }

  if (req.body.tags) {
    const transaction = await db.sequelize.transaction();
    try {
      const tagIds = await createTagsIfStringIds(req.body.tags, transaction);
      await db.Game.findByPk(id, { transaction }).then(
        (data) => data.setTags(tagIds, { transaction }),
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      res.status(500).send({
        id,
        status: 'error',
        message: 'Failed to update tags.',
      });
      return;
    }
  }

  if (req.body.whitePlayerId) {
    const whitePlayerId = await createPlayerIfStringId(req.body.whitePlayerId);
    body.blackPlayerId = whitePlayerId;
  }

  if (req.body.blackPlayerId) {
    const blackPlayerId = await createPlayerIfStringId(req.body.blackPlayerId);
    body.blackPlayerId = blackPlayerId;
  }

  db.Game.update(body, {
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
        status: 'failed',
      });
    }
  }).catch((err) => {
    res.status(500).send({
      id,
      status: 'error',
    });
  });
};

const deleteGame = async (req, res) => {
  const { id } = req.params;

  try {
    const game = await db.Game.findByPk(id);

    if (!game) {
      return res.status(404).send({
        id,
        status: 'failed',
        message: 'Game not found.',
      });
    }

    const positions = await game.getPositions();

    const resultFieldToUpdate = {
      white: 'gamesWonByWhite',
      black: 'gamesWonByBlack',
      draw: 'gamesDrawn',
    }[game.result];

    if (resultFieldToUpdate) {
      await Promise.all(
        positions.map(async (position) => {
          // eslint-disable-next-line no-param-reassign
          position[resultFieldToUpdate] = Math.max(position[resultFieldToUpdate] - 1, 0);
          await position.save();
        }),
      );
    }

    await game.destroy();

    res.send({
      id,
      status: 'success',
      message: 'Game deleted successfully.',
    });
  } catch (err) {
    res.status(500).send({
      id,
      status: 'error',
      message: err.message || 'Some error occurred when deleting the Game.',
    });
  }
};

const findGames = async (req, res) => {
  const where = {};

  if (req.query.whitePlayerId) {
    where.whitePlayerId = req.query.whitePlayerId;
  }

  if (req.query.blackPlayerId) {
    where.blackPlayerId = req.query.blackPlayerId;
  }

  if (req.query.startDate && req.query.endDate) {
    where.datePlayed = {
      [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)],
    };
  }

  if (req.query.result) {
    where.result = req.query.result;
  }

  const filters = {
    where,
    include: [
      { model: db.Player, as: 'whitePlayer', attributes: ['id', 'name', 'title', 'urls'] },
      { model: db.Player, as: 'blackPlayer', attributes: ['id', 'name', 'title', 'urls'] },
    ],
    attributes: ['id', 'moves', 'numMoves', 'datePlayed', 'result', 'meta'],
  };

  if (req.query.tags) {
    filters.attributes = { exclude: ['tags'], include: filters.attributes };
    filters.distinct = true;
    filters.group = ['game.id'];
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

  if (req.query.sortBy) {
    const sortDir = ['ASC', 'DESC'].includes(req.query.sortDir) ? req.query.sortDir : 'ASC';
    const { sortBy } = req.query;
    if (['datePlayed', 'numMoves'].includes(sortBy)) {
      filters.order = [[sortBy, sortDir]];
    }
  }

  const totalGames = await db.Game.count({ where });

  const MAX_PER_PAGE = 50;

  const currentPage = Math.max(parseInt(req.query.page || 1, 10), 1);
  const perPage = Math.min(parseInt(req.query.perPage || MAX_PER_PAGE, 10), MAX_PER_PAGE);

  const totalPages = Math.ceil(totalGames / perPage);

  filters.limit = perPage;
  filters.offset = (currentPage - 1) * perPage;
  filters.subQuery = false;

  db.Game.findAll(filters)
    .then((games) => {
      const gamesWithoutTags = games.map((game) => {
        const { tags, ...gameWithoutTags } = game.toJSON();
        return gameWithoutTags;
      });
      return gamesWithoutTags;
    })
    .then((data) => {
      res.send({
        currentPage,
        totalPages,
        totalGames,
        games: data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        status: 'error',
      });
    });
};

const getGame = (req, res) => {
  const { id } = req.params;

  db.Game.findByPk(id, {
    include: [
      {
        model: db.Tag,
        as: 'tags',
        attributes: ['id', 'name'],
        through: { attributes: [] },
      },
      {
        model: db.Player,
        as: 'whitePlayer',
        attributes: ['id', 'name'],
      },
      {
        model: db.Player,
        as: 'blackPlayer',
        attributes: ['id', 'name'],
      },
    ],
  })
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
  createGame,
  updateGame,
  deleteGame,
  findGames,
  getGame,
};
