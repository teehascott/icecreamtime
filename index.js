require("dotenv").config();
const pg = require('pg');
const express = require('express');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_icecream_shop');
const app = express()
const port = process.env.PORT || 3000;


const init = async () => {
    await client.connect();
    console.log('connected to database');
    let SQL = /*SQL*/ `
    DROP TABLE IF EXISTS flavor;
    CREATE TABLE flavor(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    name VARCHAR(255) NOT NULL,
    is_favorite VARCHAR(255) NOT NULL
    )`;
    await client.query(SQL);
    console.log('tables created');
    SQL = /*SQL*/ `
    INSERT INTO flavor(is_favorite, name) VALUES('noble', 'mint chocolate chip');
    INSERT INTO flavor(is_favorite, name) VALUES('ferrin', 'vanilla');
    INSERT INTO flavor(is_favorite, name) VALUES('soul', 'strawberry');
    INSERT INTO flavor(is_favorite, name) VALUES('krukid', 'bubblegum');
    INSERT INTO flavor(is_favorite, name) VALUES('needle', 'birthday cake');
    `;
    await client.query(SQL);
    console.log('data seeded');
    app.listen(port, () => console.log(`listening on port ${port}`));
};
app.use(express.json());
app.use(require('morgan')('dev'));
app.post('/api/flavor', async (req, res, next) => {
    try {
        const SQL = /* SQL */`
        INSERT INTO flavor(is_favorite, name)
        VALUES($1, $2)
        RETURNING *
        `;
        const response = await client.query(SQL, [req.body.flavor, req.body.name]);
        res.status(201).send(response.rows[0]);
    } catch (error) {
        res.status(500).send({ error: error.message ||'something went wrong :c' });
    }
});
app.get('/api/flavor', async (req, res, next) => {
    try {
        const SQL = /* SQL */`
        SELECT * from flavor ORDER BY created_at DESC
        `;
        const response = await client.query(SQL,)
        res.send(response.rows);
    } catch (error) {
        res.status(500).send({ error: error.message ||'oops, try again' });
    }
});
app.put('/api/flavor/:id', async (req, res, next) => {
    try {        
        const SQL = /* SQL */`
        UPDATE flavor
        SET is_favorite=$1, name=$2, updated_at=now()
        WHERE id = $3
        RETURNING *
        `;
        const response = await client.query(SQL, [
            req.body.is_favorite,
            req.body.name,
            req.params.id,
        ]);
        res.send(response.rows[0])
    } catch (error) {
        res.status(500).send({ error: error.message ||'somethin aint workin' });
    }
});
app.delete('/api/flavor/:id', async (req, res, next) => {
    try { 
        const SQL = /* SQL */`
        DELETE FROM flavor
        WHERE id = $1
        `;
        await client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    } catch (error) {
        res.status(500).send({ error: error.message ||'ah jeez, it didnt work' });
    }
});
init();