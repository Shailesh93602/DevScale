import db from "../config/database.js";

export const insertBattle = (battle, callback) => {
  const query = `INSERT INTO battles (title, description, user_id, topic, difficulty, length) VALUES (?)`;
  const values = [
    battle.title,
    battle.description,
    battle.user_id,
    battle.topic,
    battle.difficulty,
    battle.length,
  ];
  db.query(query, [values], (err, result) => {
    callback(err, result);
  });
};

export const findBattleById = (id, callback) => {
  const query = `
    SELECT b.*, u.username 
    FROM battles b
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
  `;
  db.query(query, [id], (err, result) => {
    callback(err, result[0]);
  });
};

export const findAllBattles = (callback) => {
  const query = `
    SELECT b.*, u.username 
    FROM battles b
    JOIN users u ON b.user_id = u.id
  `;
  db.query(query, (err, result) => {
    callback(err, result);
  });
};
