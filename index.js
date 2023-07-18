const mongoose = require("mongoose");
const express = require("express");
const methodOverride = require("method-override");
const connectFlash = require("connect-flash");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const layouts = require("express-ejs-layouts");
const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");
const usersController = require("./controllers/usersController");
const jobsController = require("./controllers/jobsController");
const eventsController = require("./controllers/eventsController");
const User = require("./models/user");
const expressValidator = require("express-validator");
const passport = require("passport");

const router = express.Router();
mongoose.connect("mongodb://localhost:27017/brandeis_ssa_db");

const app = express();
app.use(layouts);

router.use(
  methodOverride("_method", {
    methods: ["POST", "GET"],
  })
);

router.use(cookieParser("secret-pascode"));
router.use(expressSession({
    secret: "secret_passcode",
    cookie: {
      maxAge: 40000,
    },
    resave: false,
    saveUninitialized: false,
  })
);
router.use(connectFlash());
router.use(expressValidator());
router.use(passport.initialize());
router.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.enable('verbose errors');
//It serves static files
app.use(express.static("public"));
//ejs engine, convert .ejs to .html, expect .ejs in views
app.set("view engine", "ejs");
//enable layouts
app.use(layouts);

const db = mongoose.connection;
db.once("open", () => {
  console.log("Successfully connected to mongodb!");
});

router.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

//listen port 8080
app.set("port", process.env.PORT || 8080);

app.use("/", router);

//home page
router.get("/", (req, res) => {
  res.render("index.ejs");
});
router.get("/index", (req, res) => {
  res.render("index.ejs");
});


//user CRUD
router.get("/users",usersController.index,usersController.indexView);
router.get("/users/new", usersController.new);
router.post( "/users/create",usersController.validate,usersController.create,usersController.redirectView);

router.get("/users/login", usersController.login);
router.post("/users/login",usersController.authenticate,usersController.redirectView);

router.get("/users/:id", usersController.show, usersController.showView);
router.get("/users/:id/edit",usersController.edit,usersController.redirectView);
router.put("/users/:id/update",usersController.update,usersController.redirectView);

router.delete("/users/:id/delete",usersController.delete, usersController.redirectView);

//jobs CRUD
router.get("/jobs",jobsController.index,jobsController.indexView);
router.get("/jobs/new",jobsController.new);
router.post("/jobs/create",jobsController.create,jobsController.redirectView);
router.get("/jobs/:id", jobsController.show, jobsController.showView);
router.get("/jobs/:id/edit",jobsController.edit);
router.put(
  "/jobs/:id/update",
  jobsController.update,
  jobsController.redirectView
);
router.delete(
  "/jobs/:id/delete",
  jobsController.delete,
  jobsController.redirectView
);

//events CRUD
router.get("/events",eventsController.index,eventsController.indexView);
router.get("/events/new", eventsController.new);
router.post(
  "/events/create",
  eventsController.create,
  eventsController.redirectView
);
router.get("/events/:id", eventsController.show, eventsController.showView);
router.get("/events/:id/edit",eventsController.edit);
router.put(
  "/events/:id/update",
  eventsController.update,
  eventsController.redirectView
);
router.delete(
  "/events/:id/delete",
  eventsController.delete,
  eventsController.redirectView
);
router.post(
  "/events/:id/register",
  eventsController.register,
  eventsController.redirectView
);

//About us page
router.get("/About", homeController.About);
//Contact page
router.get("/Contact", homeController.Contact);
//log error
app.use(errorController.logErrors);
//404 error handler
app.use(errorController.pageNotFoundError);
//500 error handler
app.use(errorController.internalServerError);

app.listen(app.get("port"), () => {
  console.log(`The server is running at http://localhost:${app.get("port")}`);
});

