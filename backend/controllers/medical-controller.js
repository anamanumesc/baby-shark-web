const MedicalVisit = require('../models/medical');

const addMedicalVisit = async (req, res) => {
    const { userId } = req;
    const { date, doctor, description } = req.body;
    const file = req.file;

    const fileName = file ? file.originalname : null;
    const filePath = file ? file.path : null;

    try {
        const newMedicalVisit = new MedicalVisit({
            userId,
            dateOfVisit: date,
            doctor,
            description,
            fileName,
            filePath,
        });

        await newMedicalVisit.save();
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Medical visit added successfully.' }));
    } catch (error) {
        console.error('Error saving medical visit:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Error saving medical visit.' }));
    }
};

const getMedicalVisits = async (req, res) => {
    const { userId } = req;
    try {
        const medicalVisits = await MedicalVisit.find({ userId }).sort({ dateOfVisit: -1 });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(medicalVisits));
    } catch (error) {
        console.error('Error fetching medical visits:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Error fetching medical visits.' }));
    }
};

module.exports = { addMedicalVisit, getMedicalVisits };
