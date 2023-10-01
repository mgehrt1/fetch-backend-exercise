# Fetch Backend Exercise

This project implements a REST API for managing user points and transactions. It allows users to add points, spend points, and check their point balance.

## Instructions for running locally

1. Make sure you have Node.js installed. You can download it from [here](https://nodejs.org/).

2. Clone this repository to your local machine.

3. Open the repository in a terminal and run the following command to install dependencies:

```
npm install
```

5. Start the server by running:

```
node app.js
```

This command will start the server, and it will be running on port 8000.

4. Test the API as you wish, using tools like [Postman](https://www.postman.com/) or by sending HTTP requests directly. Refer to the "API Documentation" section below for details on available endpoints and usage examples.

## API Documentation

### Add Points

**Endpoint**: POST `/add`

Description: Adds points to the user's account.

#### Example Usage:

**Body:**

```json
{
    "payer": "DANNON",
    "points": 5000,
    "timestamp": "2020-11-02T14:00:00Z"
}
```

**Response**:

N/A

### Spend Points

**Endpoint**: POST `/spend`

Description: Allows the user to spend points following specific rules.

#### Example Usage:

**Body**:

```json
{
    "points": 2000
}
```

**Response**:

```json
[
    { "payer": "DANNON", "points": -1000 },
    { "payer": "UNILEVER", "points": -1000 }
]
```

### Get Points Balance

**Endpoint**: GET `/balance`

Description: Retrieves the user's point balance by payer.

#### Example Usage:

**Body**:

N/A

**Response**:

```json
{
    "DANNON": 4000,
    "UNILEVER": 3000,
    "MILLER COORS": 1000
}
```
