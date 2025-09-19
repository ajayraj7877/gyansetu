const express = require("express");


const { addMoney, withdrawMoney, spendMoney, getBalance } = require("./walletController");
const { joinQuiz, rewardWinner } = require("./quizController");
require("dotenv").config();

const app = express();
app.use(express.json());

// Wallet APIs
app.post("/wallet/add", async (req, res) => {
  try {
    const result = await addMoney(req.body.userId, req.body.amount);
    res.json(result);
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.post("/wallet/withdraw", async (req, res) => {
  try {
    const result = await withdrawMoney(req.body.userId, req.body.amount);
    res.json(result);
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.post("/wallet/spend", async (req, res) => {
  try {
    const result = await spendMoney(req.body.userId, req.body.amount, req.body.description);
    res.json(result);
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// ✅ New API: Get Balance
app.post("/wallet/getBalance", async (req, res) => {
  console.log("Request body:", req.body); // <-- Debug line
  try {
    const result = await getBalance(req.body.userId);
    res.json(result);
  } catch (e) {
    console.log(e); // <-- Debug errors
    res.status(400).json({ success: false, message: e.message });
  }
});


// Quiz APIs
app.post("/quiz/join", async (req, res) => {
  try {
    const result = await joinQuiz(req.body.userId, req.body.quizId);
    res.json(result);
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.post("/quiz/reward", async (req, res) => {
  try {
    const result = await rewardWinner(req.body.userId, req.body.quizId, req.body.prizeAmount);
    res.json(result);
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to GyanSetu Wallet API 🚀");
});




app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
