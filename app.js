const express = require('express')
const app = express()
const port = 8080
app.use(express.json()) // middleware
const db_conn = require('./db_connection')
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const userRoutes = require('./routes/user.routes')
const itemRoutes = require('./routes/item.routes')

app.use('/',userRoutes)
app.use('/',itemRoutes)




db_conn().then(() => {
    console.log("DB connected succeefully")
    app.listen(port, (err) => {
        if (err) {
            console.log("Error connecting DB")
        } else {
            console.log(`Server is running on ${port}`)
        }
    })
}).catch((error) => {
    console.log("Error connecting DB ", error)
})


