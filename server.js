require('dotenv').config();

const express = require('express'); //yarn add express
const configureMiddleware = require('./config/middleware');
const db = require('./dbConfig');
const bcrypt = require('bcryptjs'); // yarn add bcryptsjs
const jwt = require('jsonwebtoken');



const server = express();

//middleware
configureMiddleware(server);


server.get('/', (req, res) => {
	res.send('Number 5 is alive!!!');
});

function generateToken(user) {
	const payload = {
		username: user.username,		
	};
	const secret = process.env.JWT_SECRET;
	const options = {
		expiresIn: '45m',
	};
	return jwt.sign(payload, secret, options);
}

function lock(req, res, next) {
  // lock could also be called protected
	// the auth token is normally sent in the Authorization header
	const token = req.headers.authorization;

	if (token) {
		jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
			if (err) {
				res.status(401).json({ message: 'invalid token' });
			} else {
				req.decodedToken = decodedToken;
				next();
			}
		});
	} else {
		res.status(401).json({ message: 'no token provided' });
	}
}

server.post('/api/register', (req, res) => {
	const userInfo = req.body; // could also call userInfo credentials or creds

	const hash = bcrypt.hashSync(userInfo.password, 14);

	userInfo.password = hash;

	db('users')
		.insert(userInfo)
		.then(ids => {
			res.status(201).json(ids);
		})
		.catch(err => res.status(500).json(err));
});

server.post('/api/login', (req, res) => {
	const creds = req.body;

	db('users')
		.where({ username: creds.username })
		.first()
		.then(user => {
			if (user && bcrypt.compareSync(creds.password, user.password)) {
				// login is successful
				// create the token
        const token = generateToken(user);
        
				res.status(200).json({ message: `welcome ${user.name}`, token });
			} else {
				res.status(401).json({ message: 'You shall not pass!!' });
			}
		})
		.catch(err => res.status(500).json(err));
});

server.get('/api/users', lock, async (req, res) => {
  const users = await db('users').select('id', 'username');

	res.status(200).json({
		users,
		decodedToken: req.decodedToken,
	});
});


// function checkRole(role) {
// 	return function(req, res, next) {
// 		if (req.decodedToken.roles.includes(role)) {
// 			next();
// 		} else {
// 			res.status(403).json({ message: `you need to be an ${role}` });
// 		}
// 	};
// }

// // protect this endpoint so only logged in users can see it
// server.get('/users', lock, checkRole('admin'), async (req, res) => {
// 	const users = await db('users').select('id', 'username', 'name');

// 	res.status(200).json({
// 		users,
// 		decodedToken: req.decodedToken,
// 	});
// });

// server.get('/users/me', lock, checkRole('accountant'), async (req, res) => {
// 	const user = await db('users')
// 		.where({ username: req.decodedToken.username })
// 		.first();

// 	res.status(200).json(user);
// });

// server.get('/users/:id', lock, async (req, res) => {
// 	const user = await db('users')
// 		.where({ id: req.params.id })
// 		.first();

// 	res.status(200).json(user);
// });

module.exports = server;
