const { Router } = require("express");
const router = Router();

const notesDAO = require('../daos/notes');


// Middleware to validate the received token
  
router.use(async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send('Authorization token was not provided');
    }
    const token  = req.headers.authorization.split(' ')[1];
    const user = await notesDAO.validateToken(token);
    if (!user) {
        return res.status(401).send('Token provided is not valid');
    } else {
        req.userId = user;
        next();
    }
});

// Creating notes 
router.post("/", async (req, res, next) => {
    try {
        const note = await notesDAO.createNote(req.body.text, req.userId);
        res.status(200);
        res.json(note);
    } catch (err) {
        res.status(500).send(err.message);
    }
    

});

// Searching for notes by User Id
router.get("/", async (req, res, next) => {
    try {
        const notes = await notesDAO.getNotes(req.userId);
        res.json(notes);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// Searching for a specific note id
router.get("/:id", async (req, res, next) => {
    try {
        const note = await notesDAO.getNote(req.params.id, req.userId);
        if (note) {
            res.json(note);
        } else {
            res.status(404).send('note not found');
        }
    } catch (e) {
        res.status(400).send(e.message);
    }

});

module.exports = router;