const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');

// GET /listings
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find({}).populate('owner');
    res.render('listings/index', { listings });
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).send('Internal Server Error');
  }
});

// GET /listings/new
router.get('/new', (req, res) => {
  res.render('listings/new');
});

// GET /listings/:listingId
router.get('/:listingId', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId).populate('owner');
    
    if (!listing) {
      return res.status(404).send('Listing not found');
    }

    const userHasFavorited = listing.favoritedByUsers.some(user => user.equals(req.session.user._id));

    res.render('listings/show', { 
      listing, 
      userHasFavorited 
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.redirect('/');
  }
});

// POST /listings
router.post('/', async (req, res) => {
  try {
    const { streetAddress, city, price, size } = req.body;

    if (!streetAddress || !city || !price || !size) {
      return res.status(400).send('All fields are required.');
    }

    if (!req.session.user || !req.session.user._id) {
      return res.status(401).send('User not authenticated');
    }

    const newListing = new Listing({
      streetAddress,
      city,
      price,
      size,
      owner: req.session.user._id
    });

    await newListing.save();
    res.redirect('/listings');
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).send('Error creating listing.');
  }
});

// DELETE /listings/:listingId
router.delete('/:listingId', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);

    if (!listing) {
      return res.status(404).send('Listing not found.');
    }

    if (listing.owner.equals(req.session.user._id)) {
      await listing.deleteOne();
      res.redirect('/listings');
    } else {
      res.status(403).send("You don't have permission to do that.");
    }
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.redirect('/');
  }
});

// PUT /listings/:listingId
router.put('/:listingId', async (req, res) => {
  try {
    const currentListing = await Listing.findById(req.params.listingId);

    if (!currentListing) {
      return res.status(404).send('Listing not found');
    }

    if (currentListing.owner.equals(req.session.user._id)) {
      await currentListing.updateOne(req.body);
      res.redirect('/listings');
    } else {
      res.status(403).send("You don't have permission to do that.");
    }
  } catch (error) {
    console.error('Error updating listing:', error);
    res.redirect('/');
  }
});
// controllers/listings.js

router.get('/:listingId/edit', async (req, res) => {
    try {
      const currentListing = await Listing.findById(req.params.listingId);
      res.render('listings/edit.ejs', {
        listing: currentListing,
      });
    } catch (error) {
      console.log(error);
      res.redirect('/');
    }
  });
  

// POST /listings/:listingId/favorited-by/:userId
router.post('/:listingId/favorited-by/:userId', async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.listingId, {
      $push: { favoritedByUsers: req.params.userId }
    });
    res.redirect(`/listings/${req.params.listingId}`);
  } catch (error) {
    console.error('Error favoriting listing:', error);
    res.redirect('/');
  }
});

// DELETE /listings/:listingId/favorited-by/:userId
router.delete('/:listingId/favorited-by/:userId', async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.listingId, {
      $pull: { favoritedByUsers: req.params.userId }
    });
    res.redirect(`/listings/${req.params.listingId}`);
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.redirect('/');
  }
});

module.exports = router;