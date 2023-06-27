
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./user");

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        return done(null, false, { message: "No user found with that email" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    } catch (error) {
      return done(error);
    }
  };

  passport.use(
    new LocalStrategy({ usernameField: "email" }, authenticateUser)
  );

  passport.serializeUser((user, done) => {
    // Instead of serializing the entire user object, only serialize the user's ID
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });
}

module.exports = initialize;
