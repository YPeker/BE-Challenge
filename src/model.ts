import {DataTypes, Model, Sequelize} from 'sequelize'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3'
});

class Profile extends Model {
  declare id: number
  declare firstName: string
  declare lastName: string
  declare profession: string
  declare balance: number
  declare type: string
}
Profile.init(
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profession: {
      type: DataTypes.STRING,
      allowNull: false
    },
    balance:{
      type:DataTypes.DECIMAL(12,2)
    },
    type: {
      type: DataTypes.ENUM('client', 'contractor')
    }
  },
  {
    sequelize,
    modelName: 'Profile'
  }
);

class Contract extends Model {
  declare id: number
  declare terms: string
  declare status: string
  declare ClientId:number
  declare ContractorId: number
}
Contract.init(
  {
    terms: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status:{
      type: DataTypes.ENUM('new','in_progress','terminated')
    }
  },
  {
    sequelize,
    modelName: 'Contract'
  }
);

class Job extends Model {
  declare id: number
  declare description: string
  declare price: number
  declare paid: boolean
  declare paymentDate: Date
  declare ContractId: number
}
Job.init(
  {
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price:{
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: DataTypes.BOOLEAN,
    },
    paymentDate:{
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    modelName: 'Job'
  }
);

Profile.hasMany(Contract, {as :'Contractor',foreignKey:'ContractorId'})
Contract.belongsTo(Profile, {as: 'Contractor'})
Profile.hasMany(Contract, {as : 'Client', foreignKey:'ClientId'})
Contract.belongsTo(Profile, {as: 'Client'})
Contract.hasMany(Job)
Job.belongsTo(Contract)

export {
  sequelize,
  Profile,
  Contract,
  Job
};
