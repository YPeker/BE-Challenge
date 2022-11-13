import express from 'express'
import  bodyParser  from "body-parser"
import { sequelize } from './model'
import { Op } from 'sequelize'
import { getProfile } from './middleware/getProfile'

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * @returns contract by id
 */
app.get('/contracts/:id',getProfile , async (req, res) =>{
    const {Contract} = req.app.get('models')
    const {id} = req.params
    const contract = await Contract.findOne({where: {id}})
    if(req.profile.id !== contract.ContractorId && req.profile.id !== contract.ClientId) return res.status(401).end()
    if(!contract) return res.status(404).end()
    res.json(contract)
})

/**
 * @returns contracts given a profile
 */
 app.get('/contracts',getProfile , async (req, res) =>{
    const {Contract} = req.app.get('models')
    const {id} = req.profile
    const contracts = await Contract.findAll({where: {
        [Op.or]: [
            {ClientId: id},
            {ContractorId: id}
        ]
    }})
    if(!contracts) return res.status(404).end()
    res.json(contracts)
})

/**
 * @returns unpaid jobs given a profile
 */
 app.get('/jobs/unpaid',getProfile , async (req, res) =>{
    const {Job, Contract} = req.app.get('models')
    const {id} = req.profile
    const jobs = await Job.findAll({where: {        
        paid: {
            [Op.not]: true
        },        
    },    
    include: [{
        model: Contract,
        where: {
            [Op.or]: [
                {ClientId: id},
                {ContractorId: id}
            ],
        }
    }]
})
    if(!jobs) return res.status(404).end()
    res.json(jobs)
})

export { app } 
