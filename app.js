import express from 'express';
import bodyParser from 'body-parser';

// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');

// Set up the express app
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

async function queryBQ(){
  // Create a client
  const bigqueryClient = new BigQuery();

  const sqlQuery = `SELECT city08, highway08
	 FROM \`hack-lassonde.hack_lassonde.vehicle_data\`
	 WHERE make = "Toyota"
	 AND model = "Camry"
	 AND year = 2018
   AND trany = "Automatic (S8)"
   AND drive = "Front-Wheel Drive"`;

  const options = {
    query: sqlQuery,
  };

  // Run the query
  const [rows] = await bigqueryClient.query(options);
  var cityMileages = [];
  var highwayMileages = [];
  console.log('Query Results:');

  // query results will only be 1 row
  rows.forEach(row => {
    cityMileages.push(row['city08']);
    highwayMileages.push(row['highway08']);
    console.log(`city mileage: ${cityMileages}, highway mileage: ${highwayMileages}`);
  });

  const retData = {
    cityMileage: cityMileages[0],
    highwayMileage: highwayMileages[0],
  }
  console.log(retData);
  return retData;
}

// run a sample query
app.get('/api/swerve-vehicle-data', async (req, res) => {
  const queryData = await queryBQ();
  const city = queryData.cityMileage;
  const highway = queryData.highwayMileage;
  console.log(queryData);

  res.status(200).send({
    cityMileage: city,
    highwayMileage: highway,
  })
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});
