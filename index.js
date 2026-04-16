require('dotenv').config();
const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose');
const userRouter = require('./routes/UserRoute.js');
const adminRouter = require('./routes/AdminRouter.js')
const productRouter = require('./routes/ProductRoute.js')
const orderRouter = require('./routes/OrderRouter.js')

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use(cors())
app.use(express.json())
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);
app.use("/static", express.static("./uploads"))

app.get('/', (req, res) => {
  res.json({
    'msg': 'Hello world!'
  })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
