const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "alumni"], default: "student" },
    graduationYear: { type: Number, required: true },
    major: { type: String, required: true },
    job: { type: String},
    company: { type: String},
    city: { type: String},
    state: { type: String},
    country: { type: String},
    zipCode: { type: Number, min: 10000, max: 99999 },
    bio: { type: String},
    interests: [{ type: String }],
  },
//   {
//     timestamps: true,
//   }
);
userSchema.pre("save", function(next){
  let user = this;
  bcrypt.hash(user.password, 10).then(hash =>{
    user.password = hash;
    next();
  })
    .catch(error => {
      console.log(`Error in hashing password: ${error.message}`);
      next(error);
    });
})

userSchema.method.passwordComparison = function(inputPassword){
  let user = this;
  return bcrypt.compare(inputPassword, user.password);
};
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });
module.exports = mongoose.model("User", userSchema);