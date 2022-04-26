const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
let database = [];

chai.should();
chai.use(chaiHttp);

describe('UC-201 Registreren als nieuwe gebruiker', () => {
    describe('TC-201-1 Verplicht veld ontbreekt', () => {
        beforeEach((done) => {
            database = [];
            done();
        });

        it('When required input is missing, a valid error should be returned', (done) => {
            chai
                .request(server)
                .post('/api/user').send({
                    lastName: "Doe",
                    street: "Straat 3",
                    city: "Breda",
                    phoneNumber: "06123456789",
                    password: "secret",
                    emailAdress: "j.doe@student.avans.nl",
                    roles: [
                        "Admin"
                    ],
                }).end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equals(400);
                    result.should.be.an('string').that.equals('Firstname must be a string');
                    done();
                });
        })
    });
});