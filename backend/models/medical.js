const mongoose = require('mongoose');

const medicalVisitSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateOfVisit: { type: Date, required: true },
    doctor: { type: String, required: true },
    description: { type: String, required: true },
    pdfName: { type: String }, // Store the filename
    pdfPath: { type: String }, // Store the file path
    createdAt: { type: Date, default: Date.now }
});

const MedicalVisit = mongoose.model('MedicalVisit', medicalVisitSchema, 'medical');
module.exports = MedicalVisit;
