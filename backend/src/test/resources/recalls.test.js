const sinon = require('sinon');
const expect = require('chai').expect;
const should = require('chai').should();
const RecallsRepository = require('../../repositories/recalls');
const RecallsResource = require('../../resources/recalls');

const TYPE_VEHICLE = 'vehicle';

const MAKE_LAND_ROVER = 'LAND ROVER';

const FIRST_MODEL = 'DISCOVERY SPORT';
const SECOND_MODEL = 'DEFENDER';

const FIRST_RECALL_NUMBER = 'R/2017/153';
const SECOND_RECALL_NUMBER = 'R/2009/091';

const recallItems = {
  Items: [
    {
      model: FIRST_MODEL,
      build_end: '07/03/2017',
      build_start: '02/03/2017',
      launch_date: '23/05/2017',
      recall_number: FIRST_RECALL_NUMBER,
      make: 'LAND ROVER',
      concern: 'LOCKING RING MAY BE INCORRECTLY ASSEMBLED',
      make_model_recall_number: 'LAND ROVER-DISCOVERY SPORT-R/2017/153',
      remedy: 'Recall the vehicles that are likely to be affected and inspect the fuel pump module retaining ring ensuring it is tightened to the correct specification if required.',
      defect: 'The locking ring retaining the fuel delivery module into the fuel tank may not have been correctly assembled onto the fuel tank during the tank assembly process. The driver may smell an increase in fuel odour and in some circumstances with the vehicle static there could be liquid fuel underneath the rear of the vehicle which in the presence of an ignition source could lead to a fire. It is also possible for fuel to leak onto the road surface which in the case of diesel fuel can present a skid hazard to other road users increasing the risk of a crash.',
      vehicle_number: '479',
      vin_start: 'SALCA2BN8HH690357',
      vin_end: 'SALCA2AN6HH691251',
      type: 'vehicle',
    },
    {
      model: SECOND_MODEL,
      build_end: '13/02/2008',
      build_start: '07/06/2007',
      launch_date: '04/12/2009',
      recall_number: SECOND_RECALL_NUMBER,
      make: 'LAND ROVER',
      concern: 'PARKING BRAKE MAY BECOME INEFFECTIVE',
      make_model_recall_number: 'LAND ROVER-DEFENDER-R/2009/091',
      remedy: 'Recall the vehicles that are likely to be affected to inspect and where necessary fit a new oil seal degrease the back plate and drum and replace the brake linings.',
      defect: 'Parking brake efficiency can be impaired as a result of an incorrectly assembled oil seal at the transfer box output shaft allowing oil to contaminate the brake linings.',
      vehicle_number: '5003',
      vin_start: 'SALLDHMS87A740136',
      vin_end: 'SALLDVBS88A757662',
      type: 'vehicle',
    },
  ],
};

function getByMakeAndModel(type, make, model, callback) {
  callback(null, recallItems);
}

function getByMakeAndModelWithError(type, make, model, callback) {
  callback(new Error('Error'), null);
}

describe('RecallsResource', () => {
  describe('getByMakeAndModel() method', () => {
    it('Should return data from database mapped to list of Recall objects', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getByMakeAndModel').callsFake(getByMakeAndModel);

      const recallsResource = new RecallsResource(recallsRepository);
      recallsResource.getByMakeAndModel(TYPE_VEHICLE, MAKE_LAND_ROVER, FIRST_MODEL, (err, data) => {
        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(2);
        expect(data[0].recallNumber).to.equal('R/2017/153');
        expect(data[1].recallNumber).to.equal('R/2009/091');
        done();
      });
    });

    it('Should return error when RecallsRepository returns an error', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getByMakeAndModel').callsFake(getByMakeAndModelWithError);

      const recallsResource = new RecallsResource(recallsRepository);
      recallsResource.getByMakeAndModel(TYPE_VEHICLE, MAKE_LAND_ROVER, FIRST_MODEL, (err, data) => {
        expect(data).to.be.an('undefined');
        expect(err.message).to.equal('Error');
        expect(getByMakeAndModelWithError).to.throw(Error);
        done();
      });
    });
  });

  describe('mapToRecallList() method', () => {
    it('Should map to recall list', (done) => {
      const recallsRepository = new RecallsResource();
      const mappedRecalls = recallsRepository.mapToRecallList(recallItems.Items);

      expect(mappedRecalls).to.be.an('array');
      expect(mappedRecalls).to.have.lengthOf(2);

      mappedRecalls[0].should.have.deep.property('model', FIRST_MODEL);
      mappedRecalls[0].should.have.deep.property('recallNumber', FIRST_RECALL_NUMBER);

      mappedRecalls[1].should.have.deep.property('model', SECOND_MODEL);
      mappedRecalls[1].should.have.deep.property('recallNumber', SECOND_RECALL_NUMBER);
      done();
    });
  });
});