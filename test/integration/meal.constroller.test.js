const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
require('dotenv').config();
const dbconnection = require('../../src/database/dbconnection');

//Clear database sql
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

//Insert user sql

const INSERT_MEAL_1 =
    "INSERT INTO `meal` (`id`, `isActive`, `isVega`, `isVegan`, `isToTakeHome`, `maxAmountOfParticipants`, `price`, `imageUrl`, `name`, `description`, `allergenes`, `dateTime`, `cookId`) VALUES (1, '0', '0', '0', '1', '6', '10', '343', 'test', 'Test maaltijd', 'noten', '1000-01-01 00:00:00', 2)";

const INSERT_MEAL_2 =
    "INSERT INTO `meal` (`id`, `isActive`, `isVega`, `isVegan`, `isToTakeHome`, `maxAmountOfParticipants`, `price`, `imageUrl`, `name`, `description`, `allergenes`, `dateTime`, `cookId`) VALUES (2, '0', '0', '0', '1', '6', '10', '343', 'test 2', 'Test maaltijd 2', 'noten', '1000-01-01 00:00:00', 2)";

const INSERT_USER_1 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "d.ambesi@avans.nl", "secret", "street", "city");';

const INSERT_USER_2 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(2, "test", "test", "test@server.com", "test", "test", "test");';

const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY1MjgwNDg4OSwiZXhwIjoxNjUzODQxNjg5fQ.2shFq3anP77fCpv2jWYY1dYOUX5kmq_Sh1CWT6LqkUQ"

chai.should();
chai.use(chaiHttp);

describe('Manage meal api/meal', () => {
    describe('UC-301 add meal', () => {
        afterEach((done) => {
            dbconnection.query(CLEAR_MEAL_TABLE, (err, result, fields) => {
                if (err) throw err;
                done();
            })
        });
        it("TC 301-1 When required input is missing, a valid error should be returned", (done) => {
            chai.request(server).post('/api/meal')
                .set({ Authorization: token })
                .send({
                    description: "Testen",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: "2022-05-17T14:57:08.748Z",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    allergenes: [
                        "noten",
                        "lactose"
                    ],
                    maxAmountOfParticipants: 6,
                    price: 6.75
                })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(400);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('name must be a string');

                    done();
                });
        })

        it("TC 301-2 When the user is not logged in, a valid error should be returned", (done) => {
            chai.request(server).post('/api/meal')
                .set({ Authorization: "bearer asdfasdf" })
                .send({
                    name: "test",
                    description: "Testen",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: "2022-05-17T14:57:08.748Z",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    allergenes: [
                        "noten",
                        "lactose"
                    ],
                    maxAmountOfParticipants: 6,
                    price: 6.75
                })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(401);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('Not authorized');

                    done();
                });
        })

        it("TC 301-3 Meal successfully added", (done) => {
            chai.request(server).post('/api/meal')
                .set({ Authorization: token })
                .send({
                    name: "test",
                    description: "Testen",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: "1000-01-01 00:00:00",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    allergenes: [
                        "noten",
                        "lactose"
                    ],
                    maxAmountOfParticipants: 6,
                    price: 6.75
                })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(201);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'result');

                    let { status, message } = res.body;
                    status.should.be.a('number');

                    done();
                });
        })
    })
    describe("UC-303 Meal list", () => {
        afterEach((done) => {
            dbconnection.query(CLEAR_MEAL_TABLE, (err, result, fields) => {
                if (err) throw err;
                done();
            })
        });
        it("TC 303-1 List of meals should be returned", (done) => {
            dbconnection.query(INSERT_MEAL_1, () => {
                chai.request(server).get("/api/meal")
                    .end((err, res) => {

                        res.should.have.status(200);
                        res.should.be.an('object');
                        res.body.should.be.an('object').that.has.all.keys('status', 'result');

                        let { status, result } = res.body;
                        status.should.be.a('number');

                        done();
                    })
            })
        })
    })

    describe("UC-304 Meal details", () => {
        afterEach((done) => {
            dbconnection.query(CLEAR_MEAL_TABLE, (err, result, fields) => {
                if (err) throw err;
                done();
            })
        });
        it("TC 304-1 When the meal does not exist, a valid error should be returned", (done) => {
            chai.request(server).get("/api/meal/123123")
                .end((err, res) => {

                    res.should.have.status(404);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('Meal does not exist');

                    done();
                })
        })

        it("TC 304-2 Meal successfully returned", (done) => {
            dbconnection.query(INSERT_USER_2, () => {
                dbconnection.query(INSERT_MEAL_1, () => {
                    chai.request(server).get("/api/meal/1")
                        .end((err, res) => {

                            res.should.have.status(200);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'result');

                            let { status, result } = res.body;
                            status.should.be.a('number');

                            done();
                        })
                })

            })
        })
    })

    describe("UC-305 Delete meal", () => {
        afterEach((done) => {
            dbconnection.query(CLEAR_MEAL_TABLE, (err, result, fields) => {
                dbconnection.query(CLEAR_USERS_TABLE, () => {
                    if (err) throw err;
                    done();
                })
            })
        });

        it("TC 305-2 When the user is not logged in, a valid error should be returned", (done) => {
            dbconnection.query(INSERT_MEAL_1, () => {
                chai.request(server).delete("/api/meal/1")
                    .set({ Authorization: "bearer asdfasdf" })
                    .end((err, res) => {
                        assert.ifError(err);

                        res.should.have.status(401);
                        res.should.be.an('object');
                        res.body.should.be.an('object').that.has.all.keys('status', 'message');

                        let { status, message } = res.body;
                        status.should.be.a('number');
                        message.should.be.a('string').that.contains('Not authorized');

                        done();
                    })
            })
        })

        it("TC-305-3 When the user is not the owner of the meal, a valid error should be returned", (done) => {
            dbconnection.query(INSERT_USER_2, () => {
                dbconnection.query(INSERT_MEAL_1, () => {
                    chai
                        .request(server)
                        .delete("/api/meal/1")
                        .set({
                            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTY1MzA1NTI5NSwiZXhwIjoxNjU0MDkyMDk1fQ.OKjPkj0LsoVzksiIHt1UcXzcLDohIs6gjU-C0N-9ROg',
                        })
                        .end((req, res) => {

                            res.should.have.status(403);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'message');

                            let { status, message } = res.body;
                            status.should.be.a('number');
                            message.should.be.a('string').that.contains('You are not the owner of this meal');

                            done();
                        });
                });
            });
        });

        it("TC 305-4 When the meal does not exist, a valid error should be returned", (done) => {
            chai.request(server).delete("/api/meal/123123")
                .set({ Authorization: token })
                .end((err, res) => {

                    res.should.have.status(404);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('Meal does not exist');

                    done();
                })
        })


        it("TC-305-5 Meal successfully deleted", (done) => {
            dbconnection.query(INSERT_USER_2, () => {
                dbconnection.query(INSERT_MEAL_1, () => {
                    chai
                        .request(server)
                        .delete("/api/meal/1")
                        .set({
                            Authorization: token,
                        })
                        .end((req, res) => {

                            res.should.have.status(200);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'message');

                            let { status, message } = res.body;
                            status.should.be.a('number');
                            message.should.be.a('string').that.contains('Meal successfully deleted');

                            done();
                        });
                });
            });
        });
    })
});