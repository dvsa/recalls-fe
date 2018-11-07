const AWS = require("aws-sdk");
const CSV = require('fast-csv');
const ENVIRONMENT = process.env.ENVIRONMENT;
const RECALLS_TABLE_NAME = `cvr-${ENVIRONMENT}-recalls`;
const MAKES_TABLE_NAME = `cvr-${ENVIRONMENT}-makes`;
const MODELS_TABLE_NAME = `cvr-${ENVIRONMENT}-models`;
console.info(MAKES_TABLE_NAME);

AWS.config.update({ region: process.env.AWS_REGION });

const documentClient = new AWS.DynamoDB.DocumentClient();
const recallData = [];
const vehicleMakes = [];
const equipmentMakes = [];
const models = new Map();

function setNullIfEmptyString(string) {
  return (string === '' || !string) ? null : string;
}

function mapRecallNumberToRecallType(recallNumber) {
  const type = recallNumber.split('/')[0];
  const vehicleTypes = ['R', 'RM', 'RCT', 'RPT', 'RSPV', 'RPC'];
  return vehicleTypes.includes(type) ? 'vehicle' : 'equipment';
}

function addToArrayIfNotYetExists(array, element) {
  if(!array.includes(element)) {
    array.push(element);
  }
}

function addToMapIfNotYetExists(map, key, value) {
  if(key in map) {
    map.get(key).push(value); 
  } else {
    map.set(key, [value]);
  }
}

function Recall(launchDate, recallNumber, make, concern, defect, remedy, vehicleNumber, model, vinStart, vinEnd, buildStart, buildEnd) {
  this.recallType = mapRecallNumberToRecallType(recallNumber);
  this.launchDate = setNullIfEmptyString(launchDate);
  this.recallNumber = setNullIfEmptyString(recallNumber);
  this.make = setNullIfEmptyString(make);
  this.concern = setNullIfEmptyString(concern);
  this.defect = setNullIfEmptyString(defect);
  this.remedy = setNullIfEmptyString(remedy);
  this.vehicleNumber = setNullIfEmptyString(vehicleNumber);
  this.model = setNullIfEmptyString(model);
  this.vinStart = setNullIfEmptyString(vinStart);
  this.vinEnd = setNullIfEmptyString(vinEnd);
  this.buildStart = setNullIfEmptyString(buildStart);
  this.buildEnd = setNullIfEmptyString(buildEnd);

  if (this.recallType == 'vehicle') {
    addToArrayIfNotYetExists(vehicleMakes, make);
    addToMapIfNotYetExists(models, 'vehicle-' + make, model);
  } else {
    addToArrayIfNotYetExists(equipmentMakes, make);
    addToMapIfNotYetExists(models, 'equipment-' + make, model);
  }
}

// Read csv file and save it as an array of Recalls
CSV.fromPath('../documents/RecallsFile.csv')
.on('data', function(line) {
  if (line[0] != 'Launch Date') {
    recallData.push(new Recall(line[0], line[1], line[2], line[4], line[5], line[6], line[7], line[9], line[10], line[11], line[12], line[13]));
  }
})
.on('end', function() {
  // Insert recalls from the array to the db
  recallData.forEach(function(recall) {
    const recallsParams = {
      TableName: RECALLS_TABLE_NAME,
      Item: {
        'make_model_recall_number': recall.make + '-' + recall.model + '-' + recall.recallNumber,
        'type': recall.recallType,
        'launch_date': recall.launchDate,
        'recall_number': recall.recallNumber,
        'make': recall.make,
        'concern': recall.concern,
        'defect': recall.defect,
        'remedy': recall.remedy,
        'vehicle_number': recall.vehicleNumber,
        'model': recall.model,
        'vin_start': recall.vinStart,
        'vin_end': recall.vinEnd,
        'build_start': recall.buildStart,
        'build_end': recall.buildEnd
      }
    };
    documentClient.put(recallsParams, function(err, data) {
      if (err) {
        console.error('Unable to add recall ', recall.recallType, '. Error JSON:', JSON.stringify(err, null, 2));
        return process.exit(1);
      }
    });
  });

  // Insert makes to the db
  const makesParams = {
    RequestItems: {
      MAKES_TABLE_NAME: [
        {
          PutRequest: {
            Item: {
              'type': 'vehicle',
              'makes': vehicleMakes.sort()
            }
          }
        },
        {
          PutRequest: {
            Item: {
              'type': 'equipment',
              'makes': equipmentMakes.sort()
            }
          }
        }
      ]
    }
  };
  documentClient.batchWrite(makesParams, function(err, data) {
    if (err) {
      console.error('Unable to add makes. Error JSON:', JSON.stringify(err, null, 2));
      return process.exit(1);
    }
  });

  // Insert models to the db
  models.forEach((value, key, map) => {
    const modelsParams = {
      TableName: MODELS_TABLE_NAME,
      Item: {
        'type_make': key,
        'models': value.sort(),
      }
    };
    documentClient.put(modelsParams, (err, data) => {
      if (err) {
        console.error('Unable to add model ', key, '. Error JSON:', JSON.stringify(err, null, 2));
        return process.exit(1);
      }
    });
  });
});