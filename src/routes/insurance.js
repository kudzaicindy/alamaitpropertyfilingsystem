const express = require('express');
const { auth, checkRole } = require('../middleware/auth');
const { PropertyInsurance, VehicleInsurance, AssetInsurance } = require('../models/Insurance');
const router = express.Router();

// Property Insurance Routes
router.get('/propertyinsured', auth, async (req, res) => {
  try {
    const propertyInsurance = await PropertyInsurance.find();
    res.json({ data: propertyInsurance });
  } catch (error) {
    console.error('Error fetching property insurance:', error);
    res.status(500).json({ message: 'Error fetching property insurance' });
  }
});

router.post('/propertyinsured', auth, checkRole(['property_manager', 'finance']), async (req, res) => {
  try {
    const propertyInsurance = new PropertyInsurance(req.body);
    await propertyInsurance.save();
    res.status(201).json(propertyInsurance);
  } catch (error) {
    res.status(500).json({ message: 'Error creating property insurance' });
  }
});

router.put('/propertyinsured/:id', auth, checkRole(['property_manager', 'finance']), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInsurance = await PropertyInsurance.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!updatedInsurance) {
      return res.status(404).json({ message: 'Property insurance not found' });
    }
    
    res.json(updatedInsurance);
  } catch (error) {
    console.error('Error updating property insurance:', error);
    res.status(500).json({ message: 'Error updating property insurance' });
  }
});

router.delete('/propertyinsured/:id', auth, checkRole(['property_manager']), async (req, res) => {
  try {
    const propertyInsurance = await PropertyInsurance.findByIdAndDelete(req.params.id);
    if (!propertyInsurance) {
      return res.status(404).json({ message: 'Property insurance not found' });
    }
    res.json({ message: 'Property insurance deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting property insurance' });
  }
});

// Vehicle Insurance Routes
router.get('/insuredcars', auth, async (req, res) => {
  try {
    const vehicleInsurance = await VehicleInsurance.find();
    res.json({ data: vehicleInsurance });
  } catch (error) {
    console.error('Error fetching vehicle insurance:', error);
    res.status(500).json({ message: 'Error fetching vehicle insurance' });
  }
});

router.post('/insuredcars', auth, checkRole(['property_manager', 'finance']), async (req, res) => {
  try {
    const vehicleInsurance = new VehicleInsurance(req.body);
    await vehicleInsurance.save();
    res.status(201).json(vehicleInsurance);
  } catch (error) {
    res.status(500).json({ message: 'Error creating vehicle insurance' });
  }
});

router.put('/insuredcars/:id', auth, checkRole(['property_manager', 'finance']), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInsurance = await VehicleInsurance.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!updatedInsurance) {
      return res.status(404).json({ message: 'Vehicle insurance not found' });
    }
    
    res.json(updatedInsurance);
  } catch (error) {
    console.error('Error updating vehicle insurance:', error);
    res.status(500).json({ message: 'Error updating vehicle insurance' });
  }
});

router.delete('/insuredcars/:id', auth, checkRole(['property_manager']), async (req, res) => {
  try {
    const vehicleInsurance = await VehicleInsurance.findByIdAndDelete(req.params.id);
    if (!vehicleInsurance) {
      return res.status(404).json({ message: 'Vehicle insurance not found' });
    }
    res.json({ message: 'Vehicle insurance deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vehicle insurance' });
  }
});

// Asset Insurance Routes
router.get('/insuredcover', auth, async (req, res) => {
  try {
    const assetInsurance = await AssetInsurance.find();
    res.json({ data: assetInsurance });
  } catch (error) {
    console.error('Error fetching asset insurance:', error);
    res.status(500).json({ message: 'Error fetching asset insurance' });
  }
});

router.post('/insuredcover', auth, checkRole(['property_manager', 'finance']), async (req, res) => {
  try {
    const assetInsurance = new AssetInsurance(req.body);
    await assetInsurance.save();
    res.status(201).json(assetInsurance);
  } catch (error) {
    res.status(500).json({ message: 'Error creating asset insurance' });
  }
});

router.put('/insuredcover/:id', auth, checkRole(['property_manager', 'finance']), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInsurance = await AssetInsurance.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!updatedInsurance) {
      return res.status(404).json({ message: 'Asset insurance not found' });
    }
    
    res.json(updatedInsurance);
  } catch (error) {
    console.error('Error updating asset insurance:', error);
    res.status(500).json({ message: 'Error updating asset insurance' });
  }
});

router.delete('/insuredcover/:id', auth, checkRole(['property_manager']), async (req, res) => {
  try {
    const assetInsurance = await AssetInsurance.findByIdAndDelete(req.params.id);
    if (!assetInsurance) {
      return res.status(404).json({ message: 'Asset insurance not found' });
    }
    res.json({ message: 'Asset insurance deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting asset insurance' });
  }
});

module.exports = router; 