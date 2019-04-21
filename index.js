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
export default router;
