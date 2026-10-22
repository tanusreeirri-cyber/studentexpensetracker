const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const dataFile = path.join(__dirname, "expenses.json");

app.use(express.json());
app.use(express.static(__dirname));

// Create the data file if it does not exist
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]");
}

// Read saved expenses
function readExpenses() {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

// Save expenses to the JSON file
function saveExpenses(expenses) {
    fs.writeFileSync(
        dataFile,
        JSON.stringify(expenses, null, 2)
    );
}

app.get("/api/status", (req, res) => {
    res.json({
        message: "Student Expense Tracker backend is running!"
    });
});

// Get all expenses
app.get("/api/expenses", (req, res) => {
    res.json(readExpenses());
});

// Add an expense
app.post("/api/expenses", (req, res) => {
    const { title, amount } = req.body;

    if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return res.status(400).json({
            message: "Enter a valid title and amount."
        });
    }

    const expenses = readExpenses();

    const expense = {
        id: Date.now().toString(),
        title: title.trim(),
        amount
    };

    expenses.push(expense);
    saveExpenses(expenses);

    res.status(201).json(expense);
});

// Delete an expense
app.delete("/api/expenses/:id", (req, res) => {
    const expenses = readExpenses();

    const updatedExpenses = expenses.filter(
        expense => expense.id !== req.params.id
    );

    if (updatedExpenses.length === expenses.length) {
        return res.status(404).json({
            message: "Expense not found."
        });
    }

    saveExpenses(updatedExpenses);

    res.json({
        message: "Expense deleted successfully."
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});