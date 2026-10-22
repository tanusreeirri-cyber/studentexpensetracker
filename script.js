const form = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const totalElement = document.getElementById("total");
const expenseList = document.getElementById("expenseList");
const message = document.getElementById("message");

async function loadExpenses() {
    try {
        const response = await fetch("/api/expenses");

        if (!response.ok) {
            throw new Error("Could not load expenses");
        }

        const expenses = await response.json();
        displayExpenses(expenses);
    } catch (error) {
        message.textContent = "Unable to connect to the server.";
    }
}

function displayExpenses(expenses) {
    expenseList.innerHTML = "";

    const total = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    totalElement.textContent = "₹" + total.toFixed(2);

    expenses.forEach((expense) => {
        const item = document.createElement("li");
        const details = document.createElement("span");
        const deleteButton = document.createElement("button");

        details.textContent =
            `${expense.title} — ₹${expense.amount.toFixed(2)}`;

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", async () => {
            try {
                const response = await fetch(
                    `/api/expenses/${expense.id}`,
                    { method: "DELETE" }
                );

                if (!response.ok) {
                    throw new Error("Delete failed");
                }

                message.textContent = "Expense deleted!";
                await loadExpenses();
            } catch (error) {
                message.textContent = "Could not delete expense.";
            }
        });

        item.append(details, deleteButton);
        expenseList.appendChild(item);
    });
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);

    if (!title || !Number.isFinite(amount) || amount <= 0) {
        message.textContent = "Enter a valid name and amount.";
        return;
    }

    try {
        const response = await fetch("/api/expenses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, amount })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not add expense");
        }

        form.reset();
        message.textContent = "Expense added successfully!";
        await loadExpenses();
    } catch (error) {
        message.textContent = error.message;
    }
});

loadExpenses();