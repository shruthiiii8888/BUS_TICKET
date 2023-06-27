const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, Model, DataTypes } = require('sequelize');
const app = express();
app.use(cors());
app.use(bodyParser.json());
const router = express.Router();
const dbConfig = require("../Node.Js-Authentication-System-master/dataconnection");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD,  {
    host: dbConfig.HOST,
    port:dbConfig.port,
    dialect: dbConfig.dialect,
    operatorsAliases: false
  });
  if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
  }
  const path = require('path');
  const bcrypt = require("bcrypt");
  const passport = require("passport");
  const initializePassport = require("./passport-config");
  const flash = require("express-flash");
  const session = require("express-session");
  const methodOverride = require("method-override");
  const User = require("./user");
  initializePassport(passport);
  app.use(express.urlencoded({ extended: false }));
  app.use(flash());
  app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(methodOverride("_method"));
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
    }
class Ticket extends Model {}
Ticket.init({
  seatNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  isClosed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  name: {
    type: DataTypes.STRING,
  },
  age: {
    type: DataTypes.INTEGER,
  },
  email: {
    type: DataTypes.STRING,
  },
  contactNumber: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: 'ticket',
    indexes: [
      {
        unique: true,
        fields: ['name', 'age', 'email', 'contactNumber'],
        where: { isClosed: true }
      }
    ]
  });
sequelize.sync({force:false})
  .then(() => {
    console.log('Database and tables created.');
  });

  app.get('/tickets', checkAuthenticated,async (req, res) => {
    const tickets = await Ticket.findAll({ attributes: ['seatNumber'] });
    const seatNumbers = tickets.map(ticket => ticket.seatNumber);
    res.json(seatNumbers);
  });
  app.get('/tickets/closed',checkAuthenticated, async (req, res) => {
    const closedTickets = await Ticket.findAll({ 
      where: { isClosed: true },
      attributes: ['seatNumber']
    });
    const seatNumbers = closedTickets.map(ticket => ticket.seatNumber);
    res.json(seatNumbers);
  });
  app.get('/tickets/open', checkAuthenticated,async (req, res) => {
    const openTickets = await Ticket.findAll({ 
      where: { isClosed: false },
      attributes: ['seatNumber']
    });
    const seatNumbers = openTickets.map(ticket => ticket.seatNumber);
    res.json(seatNumbers);
  });
      
app.get('/tickets/:seatNumber',checkAuthenticated, async (req, res) => {
  const { seatNumber } = req.params;
  const ticket = await Ticket.findOne({ where: { seatNumber } });
  if (!ticket) {
    res.status(404).json({ message: `Ticket with seat number ${seatNumber} not found.` });
  } else {
    res.json(ticket);
  }
});
router.put('/tickets/:seatNumber',checkAuthenticated, (req, res) => {
  Ticket.update(req.body, { where: { seatNumber: req.params.seatNumber } })
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: 'ticket not found' });
      } else {
        Ticket.findByPk(req.params.seatNumber)
          .then((updatedTicket) => res.json({message:"ticket details updated successfully"}));
      }
    })
    .catch((err) => res.status(500).json(err));
});
const Joi = require('joi');
const schema = Joi.object({
  seatNumber: Joi.number().integer().min(1).max(40).required(),
  name: Joi.string().required(),
  age: Joi.number().integer().required(),
  email: Joi.string().email().required(),
  contactNumber: Joi.string().length(10).required(),
});

app.get('/tickets/email/:email',checkAuthenticated, async (req, res) => {
  const { email } = req.params;
  const tickets = await Ticket.findAll({ where: { email } });
  if (tickets.length === 0) {
    res.status(404).json({ message: `No tickets found with email ${email}.` });
  } else {
    res.json(tickets);
  }
});

app.post('/tickets/book',checkAuthenticated, async (req, res) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
    } else {
      const { seatNumber, name, age, email, contactNumber } = req.body;
      const ticket = await Ticket.findOne({ where: { seatNumber } });
      if (!ticket) {
        res.status(404).json({ message: `Ticket with seat number ${seatNumber} not found.` });
      } else if (ticket.isClosed) {
        res.status(400).json({ message: `Ticket with seat number ${seatNumber} is already closed.` });
      } else {
        ticket.isClosed = true;
        ticket.name = name;
        ticket.age = age;
        ticket.email = email;
        ticket.contactNumber = contactNumber;
        await ticket.save();
        res.json({ message: `Ticket with seat number ${seatNumber} booked successfully.` });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


app.post(
"/login",
checkNotAuthenticated,
passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
})
);

app.post("/register", checkNotAuthenticated, async (req, res) => {
try {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  await User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });
  res.redirect("/login");
} catch (error) {
  console.log(error);
  res.redirect("/register");
}
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); 

app.get("/", checkAuthenticated, (req, res) => {
res.render("index.ejs", { name: req.user.name });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
res.render("login.ejs");
});

app.get("/register", checkNotAuthenticated, (req, res) => {
res.render("register.ejs");
});
app.get("/about-form", (req, res) => {
res.render("about-form.ejs");
});
// ...existing code...

// Assuming you have Express.js and EJS set up
app.get('/element1',checkAuthenticated, (req, res) => {
  const userEmail = req.user.email; // Replace this with the actual user's email // Replace this with the actual last login time and date
  res.render('element1.ejs', { userEmail });
});


app.get("/element2", checkAuthenticated, (req, res) => {
res.render("element5.ejs"); // Render the "element2.ejs" template when accessing /element2
});
//app.set('view engine', 'ejs');
app.get("/element3", checkAuthenticated, (req, res) => {
  res.render("element3.ejs");
});

app.get("/element4", checkAuthenticated, (req, res) => {
res.render("element4.ejs"); // Render the "element4.ejs" template when accessing /element4
});

// ...existing code...
let userProfileData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  // Other profile data
};

// POST endpoint for saving personal informatio
const PersonalInfo= require('./profile');
// Create a new PersonalInfo record
app.post('/personalinfo', checkAuthenticated,async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Create a new PersonalInfo record in the database
    const personalInfo = await PersonalInfo.create({ name, email, phone });

    res.json(personalInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create PersonalInfo record' });
  }
});


// Retrieve personal information by email
app.get('/personalinfo', checkAuthenticated, async (req, res) => {
  try {
    const userEmail = req.query.email; // Retrieve the email from the query string

    // Retrieve the PersonalInfo record for the specified email from the database
    const personalInfo = await PersonalInfo.findOne({ where: { email: userEmail } });

    if (personalInfo) {
      res.json(personalInfo);
    } else {
      res.status(404).json({ error: 'PersonalInfo record not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve PersonalInfo record' });
  }
});



// Start the server

app.delete("/logout", function(req, res) {
req.logout();
res.redirect("/login");
});

const http = require('http');

// ...existing code...

// ...existing code...


// Assuming you have the necessary dependencies and server setup

// Set the views directory and template engine

app.get('/element', function(req, res) {
res.render('element2.ejs');
});


function checkNotAuthenticated(req, res, next) {
if (req.isAuthenticated()) {
  return res.redirect("/");
}
next();
}
app.use('/api', router);
app.listen(30, () => {
  console.log('Server started on port 30');
});
