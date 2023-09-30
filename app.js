const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8000;

app.use(bodyParser.json());

const pointsBalance = {};
const transactions = [];

app.post('/add', (req, res) => {
    const { payer, points, timestamp } = req.body;

    // Make sure all the needed parameters were passed
    if (!payer || !points || !timestamp) {
        return res.status(400).send('Invalid request data');
    }

    // Cannot add negative points
    if (points <= 0) {
        return res.status(400).send('Invalid request data, points must be positive');
    }

    transactions.push({ payer, points, timestamp });

    if (!pointsBalance[payer]) {
        pointsBalance[payer] = 0;
    }

    pointsBalance[payer] += points;

    res.sendStatus(200);
});

app.post('/spend', (req, res) => {
    const { points } = req.body;

    if (!points) {
        return res.status(400).send('Invalid request data');
    }

    let pointsToSpend = points;
    const spentPoints = [];

    transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    for (const transaction of transactions) {
        if (pointsToSpend <= 0) {
            break;
        }

        const { payer, points: transactionPoints } = transaction;

        if (transactionPoints >= 0) {
            continue;
        }

        if (Math.abs(transactionPoints) >= pointsToSpend) {
            spentPoints.push({ payer, points: -pointsToSpend });
            pointsBalance[payer] += pointsToSpend;
            pointsToSpend = 0;
        } else {
            spentPoints.push({ payer, points: transactionPoints });
            pointsBalance[payer] += Math.abs(transactionPoints);
            pointsToSpend -= Math.abs(transactionPoints);
        }
    }

    if (pointsToSpend > 0) {
        return res.status(400).send('Not enough points to spend');
    }

    res.json(spentPoints);
});

app.get('/balance', (req, res) => {
    res.json(pointsBalance);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
