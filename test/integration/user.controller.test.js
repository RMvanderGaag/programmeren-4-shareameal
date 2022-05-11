const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
require('dotenv').config();
const dbconnection = require('../../database/dbconnection');

//Clear database sql
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

//Insert user sql
const INSERT_USER_1 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "d.ambesi@avans.nl", "secret", "street", "city");';

const INSERT_USER_2 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(2, "test", "test", "test@server.com", "test", "test", "test");';

chai.should();
chai.use(chaiHttp);

describe('Manage users api/user', () => {
    describe('UC-201 add user', () => {
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_USERS_TABLE, function (dbError, results, fields) {
                    // When done with the connection, release it.
                    conn.release();

                    // Handle error after the release.
                    if (dbError) throw dbError;

                    done();
                }
                )
            });
        });

        it('TC 201-1 When a required input is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                //Firstname is missing
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                isActive: true,
                emailAdress: "j.doe@server.com",
                phoneNumber: "+31612345678",
                password: "secret"
            })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(400);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('Firstname must be a string');

                    done();
                });
        });

        it("TC 201-4 When the user already exist, a valid error should be returned", (done) => {
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                conn.query(INSERT_USER_1, function (dbError, results, fields) {
                    // When done with the connection, release it.
                    conn.release();

                    // Handle error after the release.
                    if (dbError) throw dbError;

                    chai.request(server).post('/api/user').send({
                        firstName: 'first',
                        lastName: "last",
                        street: "street",
                        city: "city",
                        isActive: true,
                        emailAdress: "d.ambesi@avans.nl",
                        phoneNumber: "+31646386382",
                        password: "secret"
                    })
                        .end((err, res) => {
                            assert.ifError(err);

                            res.should.have.status(409);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'message');

                            let { status, message } = res.body;
                            status.should.be.a('number');
                            message.should.be.a('string').that.contains('Email is already used');

                            done();
                        });
                }
                )
            })
        });

        it("TC 201-5 when the user is successfully stored, a succes message should be returned", (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "John",
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                isActive: true,
                emailAdress: "j.doe@server.com",
                phoneNumber: "+31612345678",
                password: "secret"
            })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'result');

                    let { status, result } = res.body;
                    status.should.be.a('number');

                    done();
                });
        })
    });

    describe('UC-204 user details', () => {
        it("TC 204-2 When a user id doesn't exist, an error should be returned", (done) => {
            chai.request(server).get("/api/user/1000")
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(404);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('User does not exist');

                    done();
                });
        });

        it("TC 204-3 When the user with id can be found, a succes message should be returned", (done) => {
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                conn.query(INSERT_USER_1, function (dbError, results, fields) {
                    // When done with the connection, release it.
                    conn.release();

                    // Handle error after the release.
                    if (dbError) throw dbError;

                    chai.request(server).get("/api/user/1")
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'result');

                            let { status, result } = res.body;
                            status.should.be.a('number');

                            done();
                        });

                });
            });
        });
    });
    describe('UC-205 Change user details', () => {
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_USERS_TABLE, function (dbError, results, fields) {
                    // When done with the connection, release it.
                    conn.release();

                    // Handle error after the release.
                    if (dbError) throw dbError;

                    done();
                }
                )
            });
        });
        it("TC 205-1 When a required input is missing when updating a user, a valid error should should be returned", (done) => {
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                conn.query(INSERT_USER_1, function (dbError, results, fields) {
                    // When done with the connection, release it.
                    conn.release();

                    // Handle error after the release.
                    if (dbError) throw dbError;

                    chai.request(server).put('/api/user/1').send({
                        lastName: "last",
                        street: "street",
                        city: "city",
                        isActive: true,
                        emailAdress: "d.ambesi@avans.nl",
                        phoneNumber: "+31646386382",
                        password: "secret"
                    })
                        .end((err, res) => {
                            assert.ifError(err);

                            res.should.have.status(400);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'message');

                            let { status, message } = res.body;
                            status.should.be.a('number');
                            message.should.be.a('string').that.contains('Firstname must be a string');

                            done();
                        });
                });
            });
        });

        it("TC 205-4 When a user does not exist while updating, a error should be returned", (done) => {
            chai.request(server).put("/api/user/1000").send({
                firstName: "first",
                lastName: "last",
                street: "street",
                city: "city",
                isActive: true,
                emailAdress: "d.ambesi@avans.nl",
                phoneNumber: "+31646386382",
                password: "secret"
            })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(404);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('User does not exist');

                    done();
                });
        });

        it("TC 205-6 When a user is successfully updated, a success message should be returned", (done) => {
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                conn.query(INSERT_USER_1, function (dbError, results, fields) {
                    // When done with the connection, release it.
                    conn.release();

                    // Handle error after the release.
                    if (dbError) throw dbError;

                    chai.request(server).put('/api/user/1').send({
                        firstName: "Pieter",
                        lastName: "last",
                        street: "street",
                        city: "city",
                        isActive: true,
                        emailAdress: "d.ambesi@avans.nl",
                        phoneNumber: "+31646386382",
                        password: "secret"
                    })
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'result');

                            let { status, result } = res.body;
                            status.should.be.a('number');

                            done();
                        });
                });
            });
        });
    });

    describe('UC-205 Change user details', () => {
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_USERS_TABLE, function (dbError, results, fields) {
                    // When done with the connection, release it.
                    conn.release();

                    // Handle error after the release.
                    if (dbError) throw dbError;

                    done();
                }
                )
            });
        });
        it("TC 206-1 When a user does not exist while trying to delete, an error should be returned", (done) => {
            chai.request(server).delete("/api/user/1000")
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('User does not exist');

                    done();
                });
        });

        it("TC 206-4 When a user is successfully deleted, a success message should be returned", (done) => {
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                conn.query(INSERT_USER_1, function (dbError, results, fields) {
                    // When done with the connection, release it.
                    conn.release();

                    // Handle error after the release.
                    if (dbError) throw dbError;

                    chai.request(server).delete('/api/user/1')
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'result');

                            let { status, result } = res.body;
                            status.should.be.a('number');

                            done();
                        });
                });
            });
        })
    });
});
