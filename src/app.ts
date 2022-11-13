import express from 'express'
import  bodyParser  from "body-parser"
import { Contract, Job, sequelize } from './model'
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
            status: 'in_progress'
        }
    }]
})
    if(!jobs) return res.status(404).end()
    res.json(jobs)
})


/**
 * @returns a client can pay for one of his jobs
 */
 app.post('/jobs/:job_id/pay',getProfile , async (req, res) =>{
    const {Job} = req.app.get('models')
    const {job_id} = req.params
    const {id} = req.profile

    try {
        await sequelize.transaction(async (t) => {
            const job: Job = await Job.findOne({where: {        
                id: job_id,
                paid: {
                    [Op.not]: true
                },  
            },    
            include: [{
                model: Contract,
                where: {
                    [Op.or]: [
                        {ClientId: id},
                    ],
                }
            }]
            })
            job.paid = true
            job.paymentDate = new Date()
            const contract = await job.getContract()
            const client = await contract.getClient()
            const contractor = await contract.getContractor()
            if(client.balance <job.price) throw new Error('Client has not enough Balance')
            client.balance -= job.price
            contractor.balance += job.price
            job.save()
            client.save()
            contractor.save()
        })

        return res.status(200).end()
    } catch (error) {
        return res.status(400).end()
    }
})


export { app } 
