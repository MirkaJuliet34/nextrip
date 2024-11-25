import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Ride extends Model {
    id: any;
    createdAt: any;
    origin: any;
    destination: any;
    distance: any;
    duration: any;
    driver_id: any;
    driver_name: any;
    value: any;
}

Ride.init({
  customer_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  distance: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  driver_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Ride'
});
