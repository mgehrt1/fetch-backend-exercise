const express = require('express');
const bodyParser = require('body-parser');
const { PriorityQueue } = require('@datastructures-js/priority-queue');

const app = express();
const port = 8000;

app.use(bodyParser.json());

const pointsBalance = {}; // Keep track of the user's total points by payer
let pointsTotal = 0; // Keep track of the user's total points
// Use a Priority Queue to keep the tranasctions sorted by date, so the oldest can easily be accessed
const transactions = new PriorityQueue((a, b) => {
    const timestampA = Date.parse(a.timestamp);
    const timestampB = Date.parse(b.timestamp);
    return timestampA - timestampB;
});

app.post('/add', (req, res) => {
    const { payer, points, timestamp } = req.body;

    // Make sure all the needed parameters were passed
    if (!payer || !points || !timestamp) {
        return res.status(400).send('Invalid request data');
    }

    transactions.enqueue({ payer, points, timestamp });

    // Initialize payer points to 0 if it is a new payer
    if (!pointsBalance[payer]) {
        pointsBalance[payer] = 0;
    }

    pointsBalance[payer] += points;
    pointsTotal += points;

    res.sendStatus(200);
});

app.post('/spend', (req, res) => {
    const { points } = req.body;

    // Make sure that all needed parameters were passed
    if (!points) {
        return res.status(400).send('Invalid request data');
    }

    // The user doesn't have enough points if they try to spend more than they have
    if (points > pointsTotal) {
        return res.status(400).send('Not enough points to spend');
    }

    let pointsToSpend = points; // Number of points that still need to be spent
    const spentPoints = []; // Points spent so far, to be returned

    // Iterate until all transactions have been considered, or enough points have been spent
    while (!transactions.isEmpty() && pointsToSpend > 0) {
        const { payer, points: transactionPoints } = transactions.front();

        // Find the index of the payer in the spentPoints array, if it exists
        const existingPayerIndex = spentPoints.findIndex(obj => obj.payer === payer)

        if (Math.abs(transactionPoints) > pointsToSpend) {
            // Case where the oldest transaction has more than the amount of points needed to be spent
            transactions.front().points -= pointsToSpend;

            // Update the existing payer's spent points or add a new payer to spentPoints
            if (existingPayerIndex !== - 1) {
                spentPoints[existingPayerIndex].points -= pointsToSpend;
            } else {
                spentPoints.push({ payer, points: -pointsToSpend });
            }

            // Update payer's balance, total points, and point to spend 
            pointsBalance[payer] -= pointsToSpend;
            pointsTotal -= pointsToSpend;
            pointsToSpend = 0; // All points spent
        } else {
            // Case where the oldest transaction has less than or equal the amount of points needed to be spent
            transactions.dequeue();

            // Update the existing payer's spent points or add a new payer to spentPoints
            if (existingPayerIndex !== -1) {
                spentPoints[existingPayerIndex].points -= transactionPoints;
            } else {
                spentPoints.push({ payer, points: -transactionPoints });
            }

            // Update payer's balance, total points, and point to spend 
            pointsBalance[payer] -= transactionPoints;
            pointsTotal -= transactionPoints;
            pointsToSpend -= transactionPoints;
        }
    }

    // Respond with the list of points spent for each payer
    res.json(spentPoints);
});

app.get('/balance', (req, res) => {
    res.json(pointsBalance);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
