const Service = require('../models/Service');

// @desc    Get all services (with optional filtering)
// @route   GET /api/services
exports.getServices = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const services = await Service.find(query).populate({
      path: 'provider',
      match: { isApproved: true },
      select: 'name email phone location'
    });
    
    // Filter out services where the provider is unapproved (population returned null)
    const approvedServices = services.filter(service => service.provider);
    res.json(approvedServices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create a service
// @route   POST /api/services
exports.createService = async (req, res) => {
  try {
    // Note: Assuming provider ID is sent in body for MVP if auth middleware is not applied yet.
    // In production, `provider: req.user.id` from token.
    const { title, description, category, price, provider } = req.body;
    
    const newService = new Service({
      title,
      description,
      category,
      price,
      provider
    });

    const service = await newService.save();
    res.json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
