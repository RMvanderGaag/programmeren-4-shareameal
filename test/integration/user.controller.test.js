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
const INSERT_USER_1 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "d.ambesi@avans.nl", "secret", "street", "city");';

const INSERT_USER_2 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(2, "test", "test", "test@server.com", "test", "test", "test");';

const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY1MjgwNDg4OSwiZXhwIjoxNjUzODQxNjg5fQ.2shFq3anP77fCpv2jWYY1dYOUX5kmq_Sh1CWT6LqkUQ"

chai.should();
chai.use(chaiHttp);

describe('Manage users api/user', () => {
    describe('UC-101 login', () => {
        afterEach((done) => {
            dbconnection.query(CLEAR_USERS_TABLE, (err, result, fields) => {
                if (err) throw err;
                done();
            })
        });
        it('TC 101-1 When a required input is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/auth/login').send({
                password: "secret"
            })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(400);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('email must be a string');

                    done();
                });
        })
        it('TC 101-2 When the email address does not match the regex, a valid error should be returned', (done) => {
            chai.request(server).post('/auth/login').send({
                emailAdress: "jdoe@server",
                password: "secret"
            })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(400);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('Email is not valid');

                    done();
                });
        });
        it('TC 101-3 When the user does not exist, a valid error should be returned', (done) => {
            chai.request(server).post('/auth/login').send({
                emailAdress: "j.doe@server.com",
                password: "password"
            })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(404);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('User not found or password invalid');

                    done();
                });
        });
        it('TC 101-4 User successfully logged in', (done) => {
            dbconnection.query(INSERT_USER_1, () => {
                chai.request(server).post('/auth/login').send({
                    emailAdress: "d.ambesi@avans.nl",
                    password: "secret"
                })
                    .end((err, res) => {
                        assert.ifError(err);

                        res.should.have.status(200);
                        res.should.be.an('object');
                        res.body.should.be.an('object').that.has.all.keys('status', 'result');

                        let { status, result } = res.body;
                        status.should.be.a('number');

                        done();
                    });
            })
        })
    })

    describe('UC-201 add user', () => {
        afterEach((done) => {
            dbconnection.query(CLEAR_USERS_TABLE, (err, result, fields) => {
                if (err) throw err;
                done();
            })
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

        it('TC 201-2 When the email address does not match the regex, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "John",
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                isActive: true,
                emailAdress: "jdoe@server",
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
                    message.should.be.a('string').that.contains('Email is not valid');

                    done();
                });
        });

        it('TC 201-3 When the password does not match the regex, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "John",
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                isActive: true,
                emailAdress: "j.doe@server.com",
                phoneNumber: "+31612345678",
                password: "pass word"
            })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(400);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('Password is not valid');

                    done();
                });
        });

        it("TC 201-4 When the user already exist, a valid error should be returned", (done) => {
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                conn.query(INSERT_USER_1, function (dbError, results, fields) {
                    // When done with the connection, release it.
                    conn.release();

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
                            message.should.be.a('string').that.contains('User already exists');

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

    describe('UC-202 overview users', () => {
        afterEach((done) => {
            dbconnection.query(CLEAR_USERS_TABLE, (err, result, fields) => {
                if (err) throw err;
                done();
            })
        });
        it("TC 202-1 Zero users should be returned", (done) => {
            chai.request(server).get("/api/user/")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'result');

                    let { status, result } = res.body;
                    result.should.be.an('array').to.have.lengthOf(0);
                    status.should.be.a('number');

                    done();
                });
        });
        it("TC 202-2 Two users should be returned", (done) => {
            dbconnection.query(INSERT_USER_1, () => {
                dbconnection.query(INSERT_USER_2, () => {
                    chai.request(server).get("/api/user/")
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'result');

                            let { status, result } = res.body;
                            result.should.be.an('array').to.have.lengthOf(2);
                            status.should.be.a('number');

                            done();
                        });
                });
            });
        });
        it("TC 202-3 When search item does not match firstname, a valid error should be returned.", (done) => {
            dbconnection.query(INSERT_USER_1, () => {
                chai.request(server).get("/api/user?firstName=frank")
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.an('object');
                        res.body.should.be.an('object').that.has.all.keys('status', 'result');

                        let { status, result } = res.body;
                        result.should.be.an('array').to.have.lengthOf(0);
                        status.should.be.a('number');

                        done();
                    });
            });

        });
        it("TC 202-5 Active users should be returned", (done) => {
            dbconnection.query(INSERT_USER_1, () => {
                dbconnection.query(INSERT_USER_2, () => {
                    chai.request(server).get("/api/user?isActive=true")
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
        it("TC 202-6 User that matches the search item should be returned", (done) => {
            dbconnection.query(INSERT_USER_1, () => {
                chai.request(server).get("/api/user?firstName=first")
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

    describe("UC-203 User profile", () => {
        afterEach((done) => {
            dbconnection.query(CLEAR_USERS_TABLE, (err, result, fields) => {
                if (err) throw err;
                done();
            })
        });
        it("TC 203-1 When the token is not valid, a valid error should be returned", (done) => {
            chai.request(server).get("/api/user/profile")
                .set({ Authorization: "Bearer asdfjlasjffslasdjfs" })
                .end((err, res) => {
                    res.should.have.status(401);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('Not authorized');

                    done();
                });
        });
        it("TC 203-2 Valid token, user should be returned", (done) => {
            dbconnection.query(INSERT_USER_1, () => {
                chai.request(server).get("/api/user")
                    .set({ Authorization: token })
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

    describe("UC-204 User details", () => {
        afterEach((done) => {
            dbconnection.query(CLEAR_USERS_TABLE, (err, result, fields) => {
                if (err) throw err;
                done();
            })
        });
        it("TC 204-1 When the token is not valid, a valid error should be returned", (done) => {
            chai.request(server).get("/api/user/1")
                .set({ Authorization: "Bearer asdfjlasjffslasdjfs" })
                .end((err, res) => {
                    res.should.have.status(401);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('Not authorized');

                    done();
                });
        });
        it("TC 204-2 When a user id doesn't exist, an error should be returned", (done) => {
            chai.request(server).get("/api/user/1000")
                .set({ Authorization: token })
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
            dbconnection.query(INSERT_USER_1, () => {
                chai.request(server).get("/api/user/1")
                    .set({ Authorization: token })
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

    describe('UC-205 Change user details', () => {
        afterEach((done) => {
            dbconnection.query(CLEAR_USERS_TABLE, (err, result, fields) => {
                if (err) throw err;
                done();
            })
        });
        it("TC 205-1 When a required input is missing when updating a user, a valid error should should be returned", (done) => {
            dbconnection.query(INSERT_USER_1, () => {

                chai.request(server).put('/api/user/1')
                    .set({ Authorization: token })
                    .send({
                        firstName: "firstName",
                        lastName: "last",
                        street: "street",
                        city: "city",
                        isActive: true,
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
                        message.should.be.a('string').that.contains('EmailAddress must be a string');

                        done();
                    });

            });
        });

        it("TC 205-3 When the phonenumber does not match the regex, a valid error should be returned", (done) => {
            dbconnection.query(INSERT_USER_1, () => {

                chai.request(server).put('/api/user/1')
                    .set({ Authorization: token })
                    .send({
                        firstName: "firstName",
                        lastName: "last",
                        street: "street",
                        city: "city",
                        isActive: true,
                        emailAdress: "d.ambesi@avans.nl",
                        phoneNumber: "123 123",
                        password: "secret"
                    })
                    .end((err, res) => {
                        assert.ifError(err);

                        res.should.have.status(400);
                        res.should.be.an('object');
                        res.body.should.be.an('object').that.has.all.keys('status', 'message');

                        let { status, message } = res.body;
                        status.should.be.a('number');
                        message.should.be.a('string').that.contains('Phonenumber is not valid');

                        done();
                    });

            });
        });

        it("TC 205-4 When a user does not exist while updating, a error should be returned", (done) => {
            chai.request(server).put("/api/user/1000")
                .set({ Authorization: token })
                .send({
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
                    res.should.have.status(400);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('User does not exist');

                    done();
                });
        });

        it("TC 205-5 When the user is not authorized, a valid error should be returned", (done) => {
            dbconnection.query(INSERT_USER_1, () => {

                chai.request(server).put('/api/user/1')
                    .set({ Authorization: "bearer asldfjaslasdfasdf" })
                    .send({
                        firstName: "firstName",
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

                        res.should.have.status(401);
                        res.should.be.an('object');
                        res.body.should.be.an('object').that.has.all.keys('status', 'message');

                        let { status, message } = res.body;
                        status.should.be.a('number');
                        message.should.be.a('string').that.contains('Not authorized');

                        done();
                    });

            });
        });

        it("TC 205-6 When a user is successfully updated, a success message should be returned", (done) => {
            dbconnection.query(INSERT_USER_1, () => {
                chai.request(server).put('/api/user/1')
                    .set({ Authorization: token })
                    .send({
                        firstName: "firstName",
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
    describe('UC-206 Deleting a user', () => {
        it("TC 206-1 When a user does not exist while trying to delete, an error should be returned", (done) => {
            chai.request(server)
                .delete("/api/user/2")
                .set({ Authorization: token })
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

        it("TC 206-2 When the user is not authorized, a valid error should be returned", (done) => {
            dbconnection.query(INSERT_USER_1, () => {
                chai.request(server)
                    .delete("/api/user/1")
                    .set({ Authorization: "Bearer adsfasdasdfasdf" })
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
            });
        });

        it("TC 206-3 When the user is not the owner of the account while trying to delete it, a valid error should be returned", (done) => {
            dbconnection.query(INSERT_USER_1, () => {
                chai.request(server)
                    .delete("/api/user/1")
                    .set({ Authorization: token })
                    .end((err, res) => {
                        assert.ifError(err);
                        res.should.have.status(403);
                        res.should.be.an('object');
                        res.body.should.be.an('object').that.has.all.keys('status', 'message');

                        let { status, message } = res.body;
                        status.should.be.a('number');
                        message.should.be.a('string').that.contains('User is not the owner of this account');

                        done();
                    });
            });
        });

        it("TC 206-4 User successfully deleted", (done) => {
            dbconnection.query(INSERT_USER_2, () => {
                chai.request(server)
                    .delete("/api/user/2")
                    .set({ Authorization: token })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.an('object');
                        res.body.should.be.an('object').that.has.all.keys('status', 'message');

                        let { status, message } = res.body;
                        status.should.be.a('number');
                        message.should.be.a('string').that.contains('User is successfully deleted');

                        done();
                    });
            });
        });

    });
});
