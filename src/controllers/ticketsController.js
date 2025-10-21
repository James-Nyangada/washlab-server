// controllers/ticketsController.js
const Ticket = require("../models/Ticket");
const Asset = require("../models/Asset");

// @desc Get all tickets (filter by asset if provided)
exports.getTickets = async (req, res) => {
  try {
    const { asset_id } = req.query;

    const query = asset_id ? { asset: asset_id } : {};
    const tickets = await Ticket.find(query)
      .populate("asset", "siteName county status")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Error fetching tickets", error: error.message });
  }
};

// @desc Create new maintenance/work order ticket
exports.createTicket = async (req, res) => {
  try {
    const { assetId, title, description, category, priority, createdBy, assignedTo } = req.body;

    if (!assetId || !title) {
      return res.status(400).json({ message: "assetId and title are required" });
    }

    const newTicket = await Ticket.create({
      asset: assetId,
      title,
      description,
      category,
      priority,
      createdBy,
      assignedTo,
    });

    res.status(201).json({ message: "Ticket created successfully", ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: "Error creating ticket", error: error.message });
  }
};

// @desc Update ticket status or info
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, assignedTo } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status, resolutionNotes, assignedTo, closedAt: status === "closed" ? new Date() : null },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.json({ message: "Ticket updated successfully", ticket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ message: "Error updating ticket", error: error.message });
  }
};
