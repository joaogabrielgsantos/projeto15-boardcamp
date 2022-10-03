import express from 'express';
import dotenv from 'dotenv';
import connection from '../src/database.js'
import joi from 'joi';

dotenv.config();
const app = express()
app.use(express.json());



const categorySchema = joi.object({
    name: joi.string().min(1).required(),
});
const gameSchema = joi.object({
    name: joi.string().min(1).required(),
    image: joi.string().min(1).required(),
    stockTotal: joi.number().greater(0).required(),
    categoryId: joi.number().greater(0).required(),
    pricePerDay: joi.number().greater(0).required()
});




app.get("/status", (req, res) => {
    console.log("GET /status...");
    res.send("Tudo OK");
});



app.get('/categories', async (req, res) => {
    try {

        const categories = await connection.query(
            `SELECT * FROM categories;`
        );
        if (categories.rowCount === 0) {
            return res.send("Sem dados")
        }



        res.send(categories.rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post('/categories', async (req, res) => {
    const { name } = req.body


    const validation = categorySchema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message);
        res.status(400).send(erros);
        return;
    }


    try {

        const findCategory = await connection.query(
            `SELECT * FROM categories WHERE categories.name = $1;`, [name]
        );
        if (findCategory.rowCount !== 0) {
            return res.sendStatus(409);

        }
        const categories = await connection.query(
            `INSERT INTO categories (name) VALUES ($1);`, [name]
        );
        return res.sendStatus(201);

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});




app.get('/games', async (req, res) => {
    try {
        const { name } = req.query;

        if (name) {
            const gamesFiltered = await connection.query(
                `SELECT * FROM games WHERE games.name = $1;`, [name]
            );
            console.log("caiu aqui");
        }

        const games = await connection.query(
            `SELECT * FROM games;`
        );
        if (games.rowCount === 0) {
            return res.send("Sem dados")
        }



        res.send(games.rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


app.post('/games', async (req, res) => {
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body

    const checkId = await connection.query(
        `SELECT * FROM games WHERE games."categoryId" = $1;`, [categoryId]
    );
    
    if(checkId.rowCount !== 0){
        return res.sendStatus(400)
    }


    const validation = gameSchema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message);
        res.status(400).send(erros);
        return;
    }


    try {

        const findGame = await connection.query(
            `SELECT * FROM games WHERE games.name = $1;`, [name]
        );
        if (findGame.rowCount !== 0) {
            return res.sendStatus(409);

        }
        const insertGame = await connection.query(
            `INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5);`, [name, image, stockTotal, categoryId, pricePerDay]
        );
        return res.sendStatus(201);

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});




app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));