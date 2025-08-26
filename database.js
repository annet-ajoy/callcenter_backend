const { Sequelize } = require( 'sequelize' );

const db = new Sequelize(
	process.env.DB_DATABASE,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
	  host: process.env.DB_HOST,
	  dialect: 'mysql',
	  timezone: '+05:30',
	  pool: {
		max: 10,     
		min: 0,      
		acquire: 30000, 
		idle: 10000  
	  }
	}
  );
const getConnection = new Sequelize(
	process.env.DB_DATABASE1,
	process.env.DB_USER,
	process.env.DB_PASSWORD,{
		host: process.env.DB_HOST,
		dialect: 'mysql',
		timezone: '+05:30',
		pool: {
		max: 20,     
		min: 5,      
		acquire: 30000, 
		idle: 10000  
	  }
	}
);
const db3 = new Sequelize(
	process.env.DB_DATABASE3,
	process.env.DB_USER,
	process.env.DB_PASSWORD,{
		host: process.env.DB_HOST,
		dialect: 'mysql',
		timezone: '+05:30'
	}
);
const db4 = new Sequelize(
	process.env.DB_DATABASE4,
	process.env.DB_USER,
	process.env.DB_PASSWORD,{
		host: process.env.DB_HOST,
		dialect: 'mysql',
		timezone: '+05:30'
	}
);
const callcenter = new Sequelize(
	process.env.DB_CALLCENTER,
	process.env.DB_USER,
	process.env.DB_PASSWORD,{
		host: process.env.DB_HOST,
		dialect: 'mysql',
		timezone: '+05:30'
	}
);
const pjSip = new Sequelize(
	process.env.DB_PJSIP,
	process.env.DB_USER,
	process.env.DB_PASSWORD,{
		host: process.env.DB_HOST,
		dialect: 'mysql',
		timezone: '+05:30',
	},
);
const rackServer = new Sequelize(
  process.env.DB_RACK_SERVER,
  process.env.DB_RACK_SERVER_USER,
  process.env.DB_RACK_SERVER_PASSWORD,
  {
    host: process.env.DB_RACK_SERVER_HOST,
    dialect: "mysql",
    timezone: "+05:30",
    pool: {
      max: 10, // max concurrent connections in pool
      min: 0, // minimum idle connections
      acquire: 30000, // max time to wait for a connection (in ms)
      idle: 10000, // connection is released if idle for 10s
    },
  }
);

const Op = Sequelize.Op;
module.exports = { db, getConnection, db3, Op, db4, callcenter, pjSip, rackServer };