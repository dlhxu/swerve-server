// load env vars prior to importing cloud stuff
const dotenv = require('dotenv').config();

// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.apiKey,
  Promise: Promise
});
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


  directionsHelper(req, res){

    // instantiate client object

    // geocode location into latlng
    geocodeWrapper();

    // query maps api
    googleMapsClient.directions({}).asPromise()// do something with the return
    .then((response) => {
        console.log(response.json.results);
      })
    .catch((err) => {
        console.log(err);
      });
  }

  // tutorial code
  geocodeWrapper (req, res) {
    googleMapsClient.geocode({address: '1600 Amphitheatre Parkway, Mountain View, CA'}).asPromise()
      .finally(()=>{console.log("Promise ready")})
      .then((response) => {
        console.log(response.json.results);
        const latlng = response.json.results[0].geometry.location;
        res.status(200).send({
          response: response.json.results,
          latitude: latlng.lat,
          longitutde: latlng.lng,
        });
      })
      .catch((err) => {
        console.log(err);
      });
    }
}

const apiController = new ApiController();
export default apiController;
