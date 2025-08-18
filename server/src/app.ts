import express,{Request,Response} from 'express';
import { errorHandler } from './middlewares/errorHandler';
import mongoose from 'mongoose';
import uploadRouter from './routes/helper.routes'
import cors from 'cors'


const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended:true}));
mongoose.connect('mongodb://127.0.0.1:27017/InnDB?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.6')

app.get('/',(req:Request, res:Response)=>{
    console.log('working')
    res.send('working')
})

app.use('/api',uploadRouter);


app.use(errorHandler);

export default app;

