module.exports = (app) => {
	function delay(time) {
		return new Promise(function(resolve) {
			setTimeout(resolve, time);
		});
	}
	const bcrypt = require('bcryptjs');
	const puppeteer = require('puppeteer');

	//login route --> return userInformation
	app.post('/login', (req, res) => {
		//check if the user already exists in mongodb
		passport.authenticate('local', {
			successRedirect: '/login_success',
			failureRedirect: '/login_failure'
		})(req, res);
	});

	app.get('/login_success', (req, res) => {
		const response = { loginStatus: true, errorMessage: 'No Errors found!, return the user data here' };
		res.send(response);
	});

	app.get('/login_failure', (req, res) => {
		const { utorid, password } = req.body;
		//2 cases, either a user isnt registered yet, or invalid user/pass combo

		//check for user/pass combo
		const response = { registerStatus: false, errorMessage: 'An error occured. Make sure login info is correct.' };

		res.send(response);
	});

	//register route --> create new User and Scrape acorn for info --> invoke login route

	//utoronto credentials verification route--> includes webscraper
	app.post('/validate-ut-credentials', async (req, res) => {
		const { utorid, password } = req.body;
		const response = { status: false };
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
				response.status = true;
			}
		}

		res.send(response);
	});
};
