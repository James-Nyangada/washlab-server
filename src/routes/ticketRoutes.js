const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketsController");

// Tickets
router.get("/tickets", ticketController.getTickets);
router.post("/tickets", ticketController.createTicket);
router.patch("/tickets/:id", ticketController.updateTicket);

// Alerts (EWS) - TODO: Implement these controller functions
// router.get("/ews/alerts", ticketController.getActiveAlerts);
// router.post("/ews/actions", ticketController.linkAlertToTicket);

module.exports = router;
