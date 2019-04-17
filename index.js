const {BigQuery} = require('@google-cloud/bigquery');

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

  console.log('Query Results:');
  rows.forEach(row => {
    const city08 = row['city08'];
    const highway08 = row['highway08'];
    console.log(`city mileage: ${city08}, highway mileage: ${highway08}`);
  });
}

queryBQ();
