const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const moduleModel = db.define( "moduleModel", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    plan_type: { type: Sequelize.STRING },
    amount: { type: Sequelize.INTEGER },
    notes: { type: Sequelize.INTEGER },
    additional_notes: { type: Sequelize.INTEGER },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
{
	tableName:"module",
    timestamps: false, 
} );

module.exports = moduleModel;