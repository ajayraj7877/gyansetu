const pool = require("./db");

// Add Money
async function addMoney(userId, amount) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Update wallet balance
    await conn.query("UPDATE wallets SET balance = balance + ? WHERE user_id = ?", [amount, userId]);

    // Insert transaction with ENUM 'add'
    await conn.query(
      "INSERT INTO transactions (user_id, type, amount, status, description) VALUES (?,?,?,?,?)",
      [userId, "add", amount, "success", "Money Added"]
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
    if (rows.length === 0 || rows[0].balance < amount) {
      throw new Error("Insufficient balance");
    }

    await conn.query("UPDATE wallets SET balance = balance - ? WHERE user_id = ?", [amount, userId]);

    // Insert transaction with ENUM 'withdraw'
    await conn.query(
      "INSERT INTO transactions (user_id, type, amount, status, description) VALUES (?,?,?,?,?)",
      [userId, "withdraw", amount, "success", "Money Withdrawn"]
    );

    await conn.commit();
    return { success: true, message: "Money withdrawn successfully" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Spend Money
async function spendMoney(userId, amount, description) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query("SELECT balance FROM wallets WHERE user_id = ?", [userId]);
    if (rows.length === 0 || rows[0].balance < amount) {
      throw new Error("Insufficient balance");
    }

    await conn.query("UPDATE wallets SET balance = balance - ? WHERE user_id = ?", [amount, userId]);

    // Insert transaction with ENUM 'spend'
    await conn.query(
      "INSERT INTO transactions (user_id, type, amount, status, description) VALUES (?,?,?,?,?)",
      [userId, "spend", amount, "success", description || "Spent"]
    );

    await conn.commit();
    return { success: true, message: "Money spent successfully" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Get Balance
async function getBalance(userId) {
  const [rows] = await pool.query("SELECT balance FROM wallets WHERE user_id = ?", [userId]);
  if (rows.length === 0) {
    return { success: false, message: "Wallet not found", balance: 0 };
  }
  return { success: true, message: "Balance fetched successfully", balance: rows[0].balance };
}


module.exports = {
  addMoney,
  withdrawMoney,
  spendMoney,
  getBalance
};
