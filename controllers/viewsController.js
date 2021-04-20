const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert =
      "Your Booking was successfull! Please check your email for a confirmation. If your booking does't show up here immediately, please come back later.";
  }
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find().sort({ ratingsAverage: 'descending' });
  // Here i have used mongoose sort method on the query in order to sort the response in descending order of ratings so that tour with more rating is displayed at top
  console.log(tours);
  // 2) Build template

  // 3) Render the template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  //   console.log(tour);

  if (!tour) {
    return next(new AppError('There is no tour with that name..', 404));
  }
  // 2) Build template
  // 3) Render template using tour data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: `Log into your account`
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: `Your Account`
  });
};
exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all booking
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned ids
  const tourIds = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name: req.body.name, email: req.body.email },
    { new: true, runValidators: true }
  );

  res.status(200).render('account', {
    title: `Your Account`,
    user: updatedUser
  });
});
