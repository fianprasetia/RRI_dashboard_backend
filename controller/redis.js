// const redis = require('redis');

// // URL Redis
// const redisUrl = "redis://:biangkerok007@198.23.251.106:6379";
// // const redisUrl = "redis://:biangkerok007@191.96.1.66:6379";

// // Membuat klien Redis
// const client = redis.createClient({ url: redisUrl });

// // Fungsi untuk menghubungkan ke Redis
// (async () => {
//     try {
//         await client.connect();
//         console.log('Connected to Redis!');
//     } catch (error) {
//         console.error('Error connecting to Redis:', error);
//     }
// })();

// /**
//  * Mendapatkan data dari Redis
//  * @param {string} redisKey - Key yang ingin diambil dari Redis
//  * @returns {Promise<any>} - Data dari Redis (dalam bentuk string)
//  */
// async function get(redisKey) {
//     try {
//         const reply = await client.get(redisKey);
//         // console.log("Success Redis Get", redisKey, reply);
//         return reply;
//     } catch (err) {
//         // console.error("Redis Get Error:", err);
//         throw err;
//     }
// }

// /**
//  * Menyimpan data ke Redis
//  * @param {string} redisKey - Key untuk menyimpan data
//  * @param {string} redisValue - Nilai yang ingin disimpan
//  * @returns {Promise<void>}
//  */
// async function set(redisKey, redisValue) {
//     try {
//         await client.set(redisKey, redisValue);
//         console.log("Success Redis Set", redisKey, redisValue);
//     } catch (err) {
//         console.error("Redis Set Error:", err);
//         throw err;
//     }
// }

// /**
//  * Menghapus key dari Redis
//  * @param {string} redisKey - Key yang ingin dihapus dari Redis
//  * @returns {Promise<void>}
//  */
// async function clear(redisKey) {
//     try {
//         const result = await client.del(redisKey);
//         if (result === 1) {
//             console.log("Success Redis Clear", redisKey);
//         } else {
//             console.log("Redis Key Not Found", redisKey);
//         }
//     } catch (err) {
//         console.error("Redis Clear Error:", err);
//         throw err;
//     }
// }

// module.exports = { get, set, clear };
