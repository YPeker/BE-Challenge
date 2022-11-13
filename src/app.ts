import express from 'express'
import  bodyParser  from "body-parser"
import { sequelize } from './model'
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

export { app } 
