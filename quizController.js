const pool = require("./db");

// Join Quiz
async function joinQuiz(userId, quizId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [quiz] = await conn.query("SELECT * FROM quizzes WHERE id = ?", [quizId]);
    if (quiz.length === 0) throw new Error("Quiz not found");
    const entryFee = quiz[0].entry_fee;

    const [rows] = await conn.query("SELECT balance FROM wallets WHERE user_id = ?", [userId]);
    if (rows[0].balance < entryFee) throw new Error("Insufficient Balance");

    await conn.query("UPDATE wallets SET balance = balance - ? WHERE user_id = ?", [entryFee, userId]);
    await conn.query(
      "INSERT INTO transactions (user_id, type, amount, status, description) VALUES (?,?,?,?,?)",
      [userId, "spend", entryFee, "success", `Joined Quiz ID ${quizId}`]
    );
    await conn.query(
      "INSERT INTO quiz_participants (quiz_id, user_id, status) VALUES (?,?,?)",
      [quizId, userId, "joined"]
    );

    await conn.commit();
    return { success: true, message: "Joined quiz successfully!" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Reward Winner
async function rewardWinner(userId, quizId, prizeAmount) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("UPDATE wallets SET balance = balance + ? WHERE user_id = ?", [prizeAmount, userId]);
    await conn.query(
      "INSERT INTO transactions (user_id, type, amount, status, description) VALUES (?,?,?,?,?)",
      [userId, "add", prizeAmount, "success", `Won Quiz ID ${quizId}`]
    );
    await conn.query(
      "UPDATE quiz_participants SET status = 'won' WHERE quiz_id = ? AND user_id = ?",
      [quizId, userId]
    );

    await conn.commit();
    return { success: true, message: `Congrats! You won ₹${prizeAmount}` };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { joinQuiz, rewardWinner };
