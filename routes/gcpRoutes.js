module.exports = (app) => {
	const gcp_API_KEY = require('../config/keys').gcpVisionKey;
	const fetch = require('node-fetch');
	//gcp vision for food
	app.post('/isFood', async (req, res) => {
		//console.log(req.body.image);
		const data = {
			requests: [
				{
					image: {
						content: req.body.image
					},
					features: [
						{
							type: 'LABEL_DETECTION',
							maxResults: 10
						}
					]
				}
			]
		};

		console.log(data);

		const resp = await fetch('https://vision.googleapis.com/v1/images:annotate?key=' + gcp_API_KEY, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		const respJSON = await resp.json();

		for (let i = 0; i < respJSON.responses[0].labelAnnotations.length; i++) {
			if (respJSON.responses[0].labelAnnotations[i].description == 'Food') {
				res.status(200).send({ isFood: true });
				return;
			}
		}

		res.status(200).send({ isFood: false });
	});
};
