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
			await page.waitForNavigation({ waitUntil: 'networkidle0' });
			if (
				page.url() === 'https://acorn.utoronto.ca/sws/welcome.do?welcome.dispatch#/' ||
				page.url() === 'https://acorn.utoronto.ca/sws/welcome.do?welcome.dispatch/'
			) {
				return true;
			}
		}
		return false;
	}

	async function scrapeSchedule(utorid, password) {
		//run webscraper to log in
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
			await page.waitForNavigation({ waitUntil: 'networkidle0' });
			/*if (page.url() !== 'https://acorn.utoronto.ca/sws/welcome.do?welcome.dispatch#/') {
				return [];
			}*/
		}
		//assume directed to the correct page
		const [ viewTimetable1 ] = await page.$x("//a[contains(., 'View Timetable')]");
		if (viewTimetable1) {
			await viewTimetable1.click();
			await delay(1000);
		}

		//assume fall for now, implement fall vs winter later
		const [ viewTimetable2 ] = await page.$x("//button[contains(., 'View Timetable')]");
		if (viewTimetable2) {
			await viewTimetable2.click();
			await delay(1000);
		}

		const course = '.meetingInfo';
		await page.waitForSelector(course);

		const courseBlock = await page.$$eval(course, (divs) => divs.map((div) => div.innerText));

		const days = '.dayInfo';
		await page.waitForSelector(days);
		const daysList = await page.$$eval(days, (divs) => divs.map((div) => div.innerText));

		const result = [];
		courseBlock.forEach((item) => {
			const terms = item.split('\n');
			const obj = {};
			obj.courseCode = terms[0];
			obj.section = terms[1];
			obj.time = terms[2];
			obj.location = terms[3];
			result.push(obj);
		});

		console.log(daysList);

		const final_result = [ [], [], [], [], [] ];
		for (let i = 0; i < daysList.length; i++) {
			result[i].day = daysList[i];
			if (daysList[i] === 'Monday') {
				final_result[0].push(result[i]);
			}
			if (daysList[i] === 'Tuesday') {
				final_result[1].push(result[i]);
			}
			if (daysList[i] === 'Wednesday') {
				final_result[2].push(result[i]);
			}
			if (daysList[i] === 'Thursday') {
				final_result[3].push(result[i]);
			}
			if (daysList[i] === 'Friday') {
				final_result[4].push(result[i]);
			}
		}

		await browser.close();

		console.log(final_result);
		return final_result;
	}
	//login route --> return userInformation
	app.post('/login', async (req, res) => {
		const { utorid, password } = req.body;
		//check if user exists in mongodb
		const user = await User.findOne({ utorid: utorid });
		if (user) {
			//user exists, check password
			const passwordValid = await bcrypt.compare(password, user.password);
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

		const credentialsValid = await validateCredentials(utorid, password);
		console.log(credentialsValid);
		if (credentialsValid) {
			//scrape the user schedule information
			const schedule = await scrapeSchedule(utorid, password);
			const newUser = new User({
				utorid: utorid,
				password: password,
				preferredName: name,
				age: age,
				discipline: discipline,
				phone: phone,
				questData: {},
				schedule: schedule
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

			res.status(200).send({ message: 'Registered!', user: newUser });
		} else {
			res.status(400).send({ message: 'error occured' });
		}
	});

	app.get('/user', async (req, res) => {
		const { utorid, hashedPassword } = req.body;
		const user = await User.findOne({ utorid: utorid });

		if (user) {
			if (user.password === hashedPassword) {
				res.status(200).send(user);
			} else {
				res.status(400).send({ error: 'nah bro' });
			}
		} else {
			res.status(400).send({ error: 'nah bro' });
		}
	});
};
