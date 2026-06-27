import express, {Request,Response,NextFunction} from 'express';
import dotenv from 'dotenv';
import { pool } from './db';
import { enqueueJob } from "./queue"

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

//route for enqueueJob
app.post('/jobs',async (req,res,next) => {
  try{
    const {payload,priority} = req.body
    if(!payload){
      return res.status(400).json({error:"Payload is required"})
    }

    const job = await enqueueJob(payload,priority || 0)
    res.status(201).json({ message: 'Job enqueued successfully', job });
  }
  catch(error){
    next(error)
  }
})

app.get('/health', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db_time: result.rows[0].now });
  } catch (error) {
    next(error)
  }
});

//global error handler
app.use((err:any,req:Request,res:Response,next:NextFunction) => {
    console.error(`ERROR Route:${req.method} ${req.path}`)
    console.error(`ERROR Message:${err.message}`)
    console.error(`ERROR Stack:${err.stack}`)
    
    res.status(500).json({
      status:'error',
      message:'Internal Server Error',
      details:err.message
    })
})
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
