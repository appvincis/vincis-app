import express from 'express';
const PORT = Number(process.env.PORT) || 4000;
const app = express();
app.get('/', (_req, res) => {
    return res.send('oie');
});
app.get('/status', (_req, res) => {
    return res.send('tamo on e roteando');
});
app.listen(PORT, () => {
    console.log('Listening on port: ' + PORT);
});
