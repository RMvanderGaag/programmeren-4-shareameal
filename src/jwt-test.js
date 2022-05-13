const jwt = require('jsonwebtoken');

const privateKey = 'secret'

jwt.sign({ foo: 'bar' }, 'privateKey', { algorithm: 'Rs256' }, function (err, token) {
    if (err) console.log(err);
    if (token) console.log(token);
})