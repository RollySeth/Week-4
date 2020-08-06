const { Router } = require("express");
const router = Router();
const loginDAO = require('../daos/login');
const noteDAO = require('../daos/notes');

//Middleware for removing duplicate checks
const logInStatus = async (req, res, next) => {
   const { authorization } = req.headers; 
  if (authorization) {
    const token = authorization.split(' ')[1];
    if (token) {
      req.token = token;
      const userId = await noteDAO.validateToken(token)
      if (userId) {
        req.userId = userId;
        next();
      } else {
        res.sendStatus(401);
      }
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
    };

    
// Logout the user
router.post("/logout", logInStatus, async (req, res, next) => {

    const deletedToken = await loginDAO.logout(req.token);
    if (deletedToken === true) {
      res.status(200).send('success');
    } else {
      res.status(401).send('failure');
    }
});

// Changing password 
router.post("/password", async (req, res, next) => {
    if (!req.headers.authorization) {
                res.status(401).send('Authorization token is missing!');
            } else if (!req.body.password || JSON.stringify(req.body.password) === '{}') {
                res.status(400).send('current Password is required before changing to new password! ');
            }
    else {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const password = req.body.password;
          
           const success = await loginDAO.changePassword(token, password);
            if (success) {
                res.status(200).send('Your password has been changed');
            } else {
                res.status(401).send('Your password was not changed');
            }
        } catch (error) {
            res.status(500).send(error.message);    
        }
    }
});

//Middleware for getting information based on shared user id and password
router.use(async (req, res, next) => {
    if (!req.body.email || JSON.stringify(req.body.email) === '{}') {
        res.status(400).send('User Id was not provided');
    } else if (!req.body.password || JSON.stringify(req.body.password) === '{}') {
        res.status(400).send('Password was not provided');
    } else {
       next();
    }
});



// Signing up with a username and password 
router.post("/signup", async (req, res, next) => {
    try {
        const person = await loginDAO.signUp(req.body);
        if (person) {
            res.status(200).send('Congratulations! Your account has been created');
        } else {
            res.status(409).send('User id already exists. Try signing in instead!');
        }
        
    } catch (error) {
        res.status(500).send(error.message);
       }
});

// Login by the user
router.post("/", async (req, res, next) => {
    try {
        const success = await loginDAO.login(req.body);
        if (success) {
            res.body = success;
            res.status(200).json(res.body);  
        } else {
            res.status(401).send('Invalid login credentials');
        }           
    } catch (error)  {
        res.status(500).send(error.message);
        }
});

module.exports = router;