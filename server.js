require('./config/connectDB')
const express = require('express')
const cors = require('cors')
const unitRouter = require('./routes/unit')
const categoriesRouter = require('./routes/categories')
const productsRouter = require('./routes/products')
const tables = require("./routes/tables");
const userRouter = require('./routes/user')
const ipRoutes = require('./routes/ipRoutes');
const orderRouter = require('./routes/order');
const logsRouter = require('./logs');
const bannerRoutes = require('./routes/bannerRoutes');


const path = require('path');

const app = express()
const port = 3000
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', unitRouter)
app.use('/', categoriesRouter)
app.use('/', productsRouter)
app.use("/", tables);
app.use('/', userRouter)
app.use('/', orderRouter);

app.use('/api', logsRouter);
app.use('/api', ipRoutes);
app.use('/api/banners', bannerRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})