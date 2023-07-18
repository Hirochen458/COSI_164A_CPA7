const User = require("../models/user");
const passport = require("passport");

const getUserParams = (body) => {
  return {
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role,
    graduationYear: body.graduationYear,
    major: body.major,
    job: body.job,
    company: body.company,
    city: body.city,
    state: body.state,
    country:  body.country,
    zipCode:  body.zipCode,
    bio: body.bio,
    interests: body.interests.split(","),
  };
};

module.exports = {
    index: (req, res, next) => {
      User.find({})
        .then((users) => {
          res.locals.users = users;
          next();
        })
        .catch((error) => {
          console.log(`Error fetching users: ${error.message}`);
          next(error);
        });
    },

    indexView: (req, res) => {
      res.render("users/index");
    },

    new: (req, res) => {
      res.render("users/new");
    },

    create: (req, res, next) => {
      if (req.skip) return next();
      let newUser = new User(getUserParams(req.body));
      User.register(newUser, req.body.password, (error, user) => {
        if (user) {
          req.flash("success",`${user.name}'s account created successfully!`);
          res.locals.redirect = "/users";
            next();
        } else {
          req.flash("error", `Failed to create user account because: ${error.message}.`);
          res.locals.redirect = "/users/new";
          next();
        }
      });
    },

    redirectView: (req, res, next) => {
      let redirectPath = res.locals.redirect;
      if (redirectPath) res.redirect(redirectPath);
      else next();
    },

    show: (req, res, next) => {
      let userId = req.params.id;
      User.findById(userId)
        .then((user) => {
          res.locals.user = user;
          next();
        })
        .catch((error) => {
          console.log(`Error fetching user by ID: ${error.message}`);
          next(error);
        });
    },

    showView: (req, res) => {
        res.render("users/show");
    },

    edit: (req, res, next) => {
      let userId = req.params.id;
      User.findById(userId)
        .then((user) => {
          res.render("users/edit", {
            user: user,
            });
        })
          .catch((error) => {
          console.log(`Error fetching user by ID: ${error.message}`);
          next(error);
        });
    },

    update: (req, res, next) => {
      let userId = req.params.id,
        userParams = getUserParams(req.body);
      User.findByIdAndUpdate(userId, {
        $set: userParams,
      })
        .then((user) => {
          res.locals.redirect = `/users/${userId}`;
          res.locals.user = user;
          next();
        })
        .catch((error) => {
          console.log(`Error updating user by ID: ${error.message}`);
          next(error);
        });
    },

    delete: (req, res, next) => {
      let userId = req.params.id;
      User.findByIdAndRemove(userId)
        .then(() => {
          res.locals.redirect = "/users";
          next();
        })
        .catch((error) => {
          console.log(`Error deleting user by ID: ${error.message}`);
          next();
        });
        
    },

    login: (req, res) => {
      res.render("users/login");
    },

    authenticate: passport.authenticate("local", {
      failureRedirect: "/users/login",
      failureFlash: "Failed to login.",
      successRedirect: "/",
      successFlash: "logged in!"
    }),

    logout: (req, res, next) => {
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
        req.flash("success", "You have been logged out!");
        res.locals.redirect = "/";
        next();
      });
    },

    validate: (req, res, next) => {
      req.sanitizeBody("email").trim();
      req.check("email", "Email is invalid").isEmail();
      req.check("password", "Password cannot be empty").notEmpty();
      req.check("zipCode", "Zip code can not be empty").notEmpty();
      req.check("zipCode", "Zip code should be numbers").isInt();
      req.check("zipCode", "Zip code should have 5 digits").isLength({
        min: 5,
        max: 5,
      });
      req.getValidationResult().then((error) => {
        if (!error.isEmpty()) {
          let messages = error.array().map(e=> e.msg);
          req.skip = true;
          req.flash("error", messages.join(" and "));
          res.locals.redirect = "/users/new";
          next();
        } else {
          next();
        }
      });
    },

    checkLogin: (req, res, next)=>{
      if(res.locals.loggedIn){
        next();
      }else{
        req.flash("error","You need to login");
        res.redirect("/users/login");
      }
    }
    
};