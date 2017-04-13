# Escalator-API

![](https://media.giphy.com/media/l4Ho9Eed9XDNQ94k0/giphy.gif)

## Set Up

### Pre-conditions

This API requires the Escalator-Queue to be running in order to function correctly. To set up the Queue, follow the steps in the README located [here](https://github.com/PagerNation/Escalator-queue)

### Installation

Ensure that [Node.js 6.x](https://nodejs.org/en/download/) and [MongoDB 3.4](https://www.mongodb.com/download-center?jmp=nav) are both installed

`npm install`

### Configuration

Numerous environment variables need to be configured before the server can be started
`.env.*` files will need to be created for each environment (`test`, `development`, `production`). Eg: `.env.test`.

The boilerplate for these is as follows

```
DB_URI=

EMAIL_USER=
EMAIL_PASS=

PHONE_SID=
PHONE_TOKEN=
PHONE_OUT=

JWT_SECRET=
QUEUE_SECRET=

QUEUE_HOST=
QUEUE_PATH=
QUEUE_PORT=

PORT=
```

The fields represent the following

`DB_URI=`

    URI of the database. If testing locally, this will generally be `mongodb://localhost/escalator-api-test`

These email settings are variable depending on if you are using a gmail account to send the messages.
**As of right now, only gmail accounts are supported**
To set up less secure auth through gmail, [click here](https://nodemailer.com/usage/using-gmail/)

`EMAIL_USER=`

    Email address to send emails from
`EMAIL_PASS=`

    Email pass for address above

Phone settings are set up for twilio, to create a free trial [click here](https://www.twilio.com/try-twilio). Once an account is created, enter the phone number you set up for outgoing messages and calls, SID, and Token below

`PHONE_SID=`

`PHONE_TOKEN=`

`PHONE_OUT=`


`JWT_SECRET=`

    JWT secret string

Queue settings are for the Escalator Queue, [found here](https://github.com/PagerNation/Escalator-queue)

`QUEUE_HOST=`

`QUEUE_PATH=`

`QUEUE_PORT=`

`QUEUE_SECRET=`

    The secret should match the secret in the Escalator-Queue environment variables

`PORT=`

    Port of this application

#### Inital creation of admin user and group

**1. Create a user**

POST - localhost:3000/api/v1/auth/signup

    `{
        "email": "test1@test.test",
        "name": "test",
        "password": "anything"
    }`

Get the id andtoken returned with the new user object, we will need it in future steps.
This user will need to be made the initial system admin in order to have full permissions. To do this, you will need to access to DB and change the `isSystemAdmin` flag on this user to `true`.

**NOTE: For ALL future steps, an auth header must be added to the requests as follows**

    Authorization: Bearer <auth token from step 1>

**2. Create a group**

POST - localhost:3000/api/v1/group

    `{
        "name": "GroupName",
        "users": [<user id from step 1>],
        "admins": [<user id from step 1>]
    }`

    Step 2 can be repeated numerous times if needed.

**With an admin user and group created, the UI can be used to complete any further tasks.**

Instructions to set up the UI can be found [here](https://github.com/PagerNation/Escalator-UI).

<hr>

### Running

`gulp serve`

## Tests

`npm test`

## Seeding

`gulp seed`
