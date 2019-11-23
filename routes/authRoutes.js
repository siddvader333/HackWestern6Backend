module.exports = (app) => {
	const bcrypt = require('bcryptjs');
	const puppeteer = require('puppeteer');
	// Load User model
	const User = require('../models/User');

	function delay(time) {
		return new Promise(function(resolve) {
			setTimeout(resolve, time);
		});
	}

	//utoronto credentials verification function--> includes webscraper

	async function validateCredentials(utorid, password) {
		//run webscraper to check if valid
		const browser = await puppeteer.launch(); // default is true
		const page = await browser.newPage();
		await page.goto('https://www.acorn.utoronto.ca/', {
			waitUntil: 'load'
		});

		const [ a ] = await page.$x("//a[contains(., 'Login to ACORN')]");
		if (a) {
			await a.click();
		}
		const selector = '#username.form-control';

		await page.waitForSelector(selector);

		await page.type(selector, utorid);

		await delay(1000);

		const selector2 = '#password.form-control';
		await page.waitForSelector(selector);
		await page.type(selector2, password);

		await delay(1000);
		const [ button ] = await page.$x("//button[contains(., 'log in')]");
		if (button) {
			await button.click();
			await delay(2000);
			if (page.url() === 'https://acorn.utoronto.ca/sws/welcome.do?welcome.dispatch#/') {
				return true;
			}
		}
		return false;
	}

	//login route --> return userInformation
	app.post('/login', async (req, res) => {
		const { utorid, password } = req.body;
		//check if user exists in mongodb
		const user = await User.findOne({ utorid: utorid });

		if (user) {
			//user exists, check password
			const passwordValid = bcrypt.compare(password, user.password, (err, isMatch) => {
				if (err) throw err;
				if (isMatch) {
					return true;
				} else {
					return false;
				}
			});
			if (passwordValid) {
				//password correct
				//return user information here
				res.status(200).send(user);
			} else {
				//password incorrect
				res.status(400).send({ error: 'Invalid Password!' });
			}
		} else {
			//user doesn't exist
			//check if utorid/pass is valid
			const credentialsValid = await validateCredentials(utorid, password);
			if (credentialsValid) {
				//indicate to frontend to redirect to register
				res.status(200).send({ message: 'Need to register user' });
			} else {
				//invalid credentials
				res.status(400).send({ error: 'Invalid Credentials!' });
			}
		}
	});

	app.post('/register', async (req, res) => {
		const { utorid, password, age, name, phone, discipline } = req.body;

		const newUser = new User({
			utorid: utorid,
			password: password,
			preferredName: name,
			age: age,
			discipline: discipline,
			phone: phone,
			questData: {}
		});

		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newUser.password, salt, (err, hash) => {
				if (err) {
					console.log(err);
					res.send(400).send({ message: 'error occurred' });
				}
				newUser.password = hash;
				newUser.save();
			});
		});

		res.status(200).send({ message: 'Registered!' });
	});
};
