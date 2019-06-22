import express from 'express';
import apiController from './apiController';
import bodyParser from 'body-parser';

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// get all todos
router.post('/api/swerve-vehicle-data', async (req, res) => {
  console.log('received a request');
  console.log(req.body);
  const queryData = await apiController.queryBQHelper(req.body);
  const city = queryData.cityMileage;
  const highway = queryData.highwayMileage;
  console.log(queryData);

  res.status(200).send({
    cityMileage: city,
    highwayMileage: highway,
  });

});

router.post('/api/sandbox/geocode', apiController.geocodeWrapper);

const googleMapsClient = require('@google/maps').createClient({
  key: process.env.apiKey,
  Promise: Promise
});

router.post('/api/sandbox/directions', (req, res) => {
  // query maps api
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
    res.status(200).send({
      response: responseData,
      retData: retData
    })
  })
  .catch((err) => {
      console.log(err);
    });
});

router.post('/api/sandbox/routeprice', async (req, res) => {
  console.log('received request');
  const routeCosts = await apiController.priceWrapper(req.body);
  console.log(routeCosts);

  // determine lowest cost route
  var cheapest = routeCosts[0].cost;
  var index = 0;
  for (var i = 1; i < routeCosts.length; i++){
    if (routeCosts[i].cost < cheapest){
      cheapest = routeCosts[i].cost;
      index = i;
    }
  }
  res.status(200).send({
    "vehicleData": req.body.vehicleData,
    "routeCosts": routeCosts,
    "cheapestRoute": index,
    "lowestCost": cheapest,
    "route": routeCosts[index].steps
  });

});

export default router;
