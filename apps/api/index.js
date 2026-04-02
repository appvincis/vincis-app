import express from 'express'

const PORT = process.env.PORT || 4000
const app = express()

app.get("/", (req, res) => {
    return res.send("oie")
})

app.get("/status", (req, res) => {
    return res.send("tamo on e roteando")
})

app.listen(PORT, () => { console.log("Listening on port: " + PORT)})
