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

  // not yet parameterized
  // do smth w/ response
  async directionsHelper(){
    googleMapsClient.directions({
      origin: 'Town Hall, Sydney, NSW',
      destination: 'Parramatta, NSW',
      alternatives: true
    }).asPromise()// do something with the return
    .then((response) => {
        const responseData = response.json
        console.log(responseData);
        var retData = []

        // populate retData with data useful to return
        for (const route of responseData.routes){
          retData.push({
            distance: route.legs[0].distance.value,
            duration: route.legs[0].duration.value,
          });
        }
        console.log("from directions helper: ");
        console.log(retData);
        return retData;
      })
    .catch((err) => {
        console.log(err);
      });
  }

  // Assumes that address will be given
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
        return latlng;
      })
      .catch((err) => {
        console.log(err);
      });
    }


  // consumes parameters from app and controls api calls to BQ and Directions APIs,
  //  consumes their returns and returns a price/trip for all routes in directions response
  async priceWrapper(payload){
    console.log('calculating route costs');

    // currently hardcoded
    const fuelPrice = 1.293;


    console.log('getting vehicle data');
    // get vehicle data
    const vehicleData = await this.queryBQHelper(payload.vehicleData);

    console.log('vehicle data: ');
    console.log(vehicleData);

    console.log('getting directions data')
    // get distance and duration data
    this.directionsHelper()
    .then((response) => {
      console.log(response);
      var routeCosts = [];
      for (const route of response){
        routeCosts.push({
          avgSpeed: route.distance / route.duration,
          cost: route.distance / vehicleData.cityMileage * fuelPrice
        });
      }

      console.log('directions data: ');
      console.log(response);

      console.log(routeCosts);
      return routeCosts;
    })
    .catch((error) => {
      console.log(error);
    });

  }


}

const apiController = new ApiController();
export default apiController;
