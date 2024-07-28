import { Sequelize, DataTypes } from 'sequelize';

let dbConnection;

if (process.env.NODE_ENV === 'test') {
  dbConnection = 'mysql://username:password@mysql_test:3306/test';
} else {
  dbConnection = 'mysql://username:password@mysql:3306/db';
}

const dbConfig = {
  dialect: 'mysql',
  logging: console.log,
  define: {
    timestamps: false,
  },
};

const sequelize = new Sequelize(dbConnection, dbConfig);

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

// Models

const Game = sequelize.define(
  'game',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    moves: DataTypes.TEXT('long'),
    numMoves: DataTypes.INTEGER,
    datePlayed: DataTypes.DATEONLY,
    result: {
      type: DataTypes.ENUM('white', 'black', 'draw'),
    },
    meta: DataTypes.JSON,
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
  },
  { tableName: 'games' },
);

const Position = sequelize.define(
  'position',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fen: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    gamesWonByWhite: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    gamesWonByBlack: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    gamesDrawn: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    movesPlayed: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    meta: DataTypes.JSON,
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
  },
  {
    tableName: 'positions',
    indexes: [
      {
        unique: false,
        fields: ['fen'],
      },
    ],
  },
);

const Player = sequelize.define('player', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  title: {
    type: DataTypes.ENUM('WCM', 'WFM', 'WIM', 'WGM', 'CM', 'FM', 'IM', 'GM'),
  },
  urls: DataTypes.JSON,
}, { tableName: 'players' });

const Tag = sequelize.define('tag', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, { tableName: 'tags' });

// Relationships

Game.belongsTo(Player, { as: 'whitePlayer' });
Game.belongsTo(Player, { as: 'blackPlayer' });

Game.belongsToMany(Position, { through: 'Game_Positions', as: 'positions' });
Position.belongsToMany(Game, { through: 'Game_Positions', as: 'games' });

Game.belongsToMany(Tag, { through: 'Game_Tags', as: 'tags' });
Tag.belongsToMany(Game, { through: 'Game_Tags', as: 'games' });

Position.belongsToMany(Tag, { through: 'Position_Tags', as: 'tags' });
Tag.belongsToMany(Position, { through: 'Position_Tags', as: 'positions' });

Game.belongsToMany(Player, { through: 'Game_Players', as: 'players' });
Player.belongsToMany(Game, { through: 'Game_Players', as: 'games' });

export {
  sequelize,
  Sequelize,
  Game,
  Position,
  Player,
  Tag,
};
