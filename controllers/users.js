const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');

// Profile route
router.get('/profile', async (req, res) => {
  try {
    // Ensure the user is authenticated and has session data
    if (!req.session.user || !req.session.user._id) {
      throw new Error('User is not authenticated');
    }

    const userId = req.session.user._id;

    // Find listings owned by the user
    const myListings = await Listing.find({ owner: userId }).populate('owner');

    // Find listings favorited by the user
    const myFavoriteListings = await Listing.find({ favoritedByUsers: userId }).populate('owner');

    // Render profile page with listings
    res.render('users/show.ejs', {
      myListings,
      myFavoriteListings
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Provide user-friendly feedback or redirect to an error page
    res.redirect('/error'); // Or render an error page if you have one
  }
});

module.exports = router;

