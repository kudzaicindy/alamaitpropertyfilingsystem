const mongoose = require('mongoose');

// Base Insurance Schema
const baseInsuranceSchema = new mongoose.Schema({
  insurer: {
    type: String,
    required: true
  },
  nextPaymentDate: {
    type: Date,
    required: true
  },
  termlyPremium: {
    type: Number,
    required: true
  },
  amountInsured: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Property Insurance Schema
const propertyInsuranceSchema = new mongoose.Schema({
  ...baseInsuranceSchema.obj,
  propertyRef: {
    type: String,
    required: true
  },
  propertyName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  }
});

// Vehicle Insurance Schema
const vehicleInsuranceSchema = new mongoose.Schema({
  ...baseInsuranceSchema.obj,
  carDetails: {
    type: String,
    required: true
  },
  responsiblePerson: {
    type: String,
    required: true
  }
});

// Asset Insurance Schema
const assetInsuranceSchema = new mongoose.Schema({
  ...baseInsuranceSchema.obj,
  cover: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  }
});

// Update timestamps on save
const updateTimestamps = function(next) {
  this.updatedAt = Date.now();
  next();
};

propertyInsuranceSchema.pre('save', updateTimestamps);
vehicleInsuranceSchema.pre('save', updateTimestamps);
assetInsuranceSchema.pre('save', updateTimestamps);

const PropertyInsurance = mongoose.model('PropertyInsurance', propertyInsuranceSchema);
const VehicleInsurance = mongoose.model('VehicleInsurance', vehicleInsuranceSchema);
const AssetInsurance = mongoose.model('AssetInsurance', assetInsuranceSchema);

module.exports = {
  PropertyInsurance,
  VehicleInsurance,
  AssetInsurance
}; 