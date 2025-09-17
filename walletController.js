const pool = require("./db");

// Add Money (UPI Success)
async function addMoney(userId, amount) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("UPDATE wallets SET balance = balance + ? WHERE user_id = ?", [amount, userId]);
    await conn.query(
      "INSERT INTO transactions (user_id, type, amount, status, description) VALUES (?,?,?,?,?)",
      [userId, "add", amount, "success", "UPI Recharge"]
    );

    await conn.commit();
    return { success: true, message: "Money added successfully" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Withdraw Money
async function withdrawMoney(userId, amount) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query("SELECT balance FROM wallets WHERE user_id = ?", [userId]);
    if (rows[0].balance < amount) throw new Error("Insufficient Balance");

    await conn.query("UPDATE wallets SET balance = balance - ? WHERE user_id = ?", [amount, userId]);
    await conn.query(
      "INSERT INTO transactions (user_id, type, amount, status, description) VALUES (?,?,?,?,?)",
      [userId, "withdraw", amount, "pending", "Bank Transfer Initiated"]
    );

    await conn.commit();
    return { success: true, message: "Withdrawal initiated" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Spend Money inside App
async function spendMoney(userId, amount, description) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query("SELECT balance FROM wallets WHERE user_id = ?", [userId]);
    if (rows[0].balance < amount) throw new Error("Insufficient Balance");

    await conn.query("UPDATE wallets SET balance = balance - ? WHERE user_id = ?", [amount, userId]);
    await conn.query(
      "INSERT INTO transactions (user_id, type, amount, status, description) VALUES (?,?,?,?,?)",
      [userId, "spend", amount, "success", description]
    );

    await conn.commit();
    return { success: true, message: "Payment Successful" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { addMoney, withdrawMoney, spendMoney };
