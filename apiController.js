// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');

class ApiController {
  async queryBQHelper(payload){
    // Create a client
    const bigqueryClient = new BigQuery();
    console.log(payload);
    const sqlQuery = `SELECT city08, highway08
  	 FROM \`hack-lassonde.hack_lassonde.vehicle_data\`
  	 WHERE make = @make
  	 AND model = @model
  	 AND year = @year
     AND trany = @trany
     AND drive = @drive`;

    const options = {
      query: sqlQuery,
      params: {
        make: payload.make,
        model: payload.model,
        year: payload.year,
        trany: payload.transmission,
        drive: payload.drive
      }
    };
    console.log(options.params);
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
    };

    console.log(retData);
    return retData;
  }
}

const apiController = new ApiController();
export default apiController;
