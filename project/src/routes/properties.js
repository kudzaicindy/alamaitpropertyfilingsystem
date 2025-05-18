const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const Property = require('../models/Property');

// Get all properties (read-only for non-managers)
router.get('/', auth, async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching properties' });
  }
});

// Create new property (property manager only)
router.post('/', auth, checkRole(['property_manager']), async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Error creating property' });
  }
});

// Update property (property manager only)
router.put('/:id', auth, checkRole(['property_manager']), async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Error updating property' });
  }
});

// Delete property (property manager only)
router.delete('/:id', auth, checkRole(['property_manager']), async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting property' });
  }
});

// Get single property (read-only for non-managers)
router.get('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching property' });
  }
});

module.exports = router; 