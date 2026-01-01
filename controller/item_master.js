const model = require("../models/index");
const messages = require("./message");
const koneksi = require("../config/database");
// const Redis = require("./redis");
const { Op } = require("sequelize");
const controller = {};
const logger = require('./logger');

controller.selectItemMaster = async function (req, res) {
  try {
    const language = req.body.language_POST;
    var codeCategory = req.body.category_POST;
    var description = req.body.description_POST;

    let whereCondition = {};
    if (description && codeCategory) {
      whereCondition = {
        [Op.and]: [
          { code_category: codeCategory },
          { name: { [Op.like]: `%${description}%` } }
        ]
      };
    } else if (codeCategory) {
      whereCondition = { code_category: codeCategory };
    } else if (description) {
      whereCondition = { name: { [Op.like]: `%${description}%` } };
    }
    // const redisKey = `selectitemMaster:${language}`;
    // Cek apakah data ada di Redis
    // const reply = await Redis.get(redisKey);
    // if (reply) {
    //     // Jika data ada di Redis, kirimkan respons dari cache
    //     return res.status(200).json({
    //         access: "success",
    //         message: "redis",
    //         data: JSON.parse(reply), // Pastikan data di-parse dari string ke JSON
    //     });
    // }
    // Jika data tidak ada di Redis, ambil dari database
    const selectitemMasterData = await model.log_item_master.findAll({
      include: [
        {
          model: model.log_item_category,
          attributes: ["code_category"],
          include:
          {
            model: model.log_item_category_translations,
            attributes: ["language_code", "translation"],
            where:
            {
              language_code: language
            },
          }
        },
      ],
      attributes: ["code_category", "code_item", "name", "uom", "status"],
      where: whereCondition,
      order: [["code_item", "ASC"]],
    });

    if (selectitemMasterData.length > 0) {
      // Simpan data ke Redis untuk caching
      // await Redis.set(redisKey, JSON.stringify(selectitemMasterData));

      // Kirimkan data dari database sebagai respons
      return res.status(200).json({
        access: "success",
        data: selectitemMasterData,
      });
    } else {
      // Jika tidak ada data, kirimkan respons kosong
      return res.status(200).json({
        access: "failed",
        message: messages[language]?.nodata,
        data: [],
      });
    }
  } catch (error) {
    // Tangani error
    return res.status(500).json({
      message: error.message,
    });
  }
}
controller.insertItemMaster = async function (req, res) {
  const transaction = await koneksi.transaction()
  try {
    const language = req.body.language_POST
    var username = req.body.username_POST
    var category = req.body.category_POST
    var description = req.body.description_POST
    var uom = req.body.uom_POST
    var status = req.body.status_POST
    let selectItemMasterData = await model.log_item_master.findAll(
      {
        where: {
          code_category: category
        }
      },
      {
        transaction: transaction
      }
    );
    if (selectItemMasterData.length > 0) {
      var idsubstringItemMaster = []
      var idsubstringItemMasterPush = []
      var idsubstringItemMasterMax
      for (var i = 0; i < selectItemMasterData.length; i++) {
        idsubstringItemMaster = JSON.parse(selectItemMasterData[i]['code_item'])
        idsubstringItemMasterPush.push(idsubstringItemMaster);
        idsubstringItemMasterMax = Math.max.apply(null, idsubstringItemMasterPush)
      }
      var substringCode = idsubstringItemMasterMax.toString();
      var endsubstringCode = substringCode.substring(3, 9);
      var endsubstringCodeEmployee = parseInt(endsubstringCode) + 1
      let noUrut = (endsubstringCodeEmployee.toString()).padStart(6, "0")
      itemCode = category + "" + noUrut
      insertItemMasterNew(itemCode)
    } else {
      no = "1"
      let noUrut = no.padStart(6, "0")
      itemCode = category + noUrut
      insertItemMasterNew(itemCode)
    }
    async function insertItemMasterNew(itemCode) {
      let insertItemMasterNewData = await model.log_item_master.create(
        {
          code_category: category,
          code_item: itemCode,
          name: description,
          uom: uom,
          status: status,
        },
        {
          transaction: transaction
        },
      );
      if (insertItemMasterNewData) {
        await transaction.commit();
        res.status(200).json({
          access: "success",
          message: messages[language]?.insertData,
          data: insertItemMasterNewData,
        });
        logger.info('Insert Item Master', {
          "1.username": `${username}`,
          "2.module": 'insertItemMaster',
          "3.status": 'success',
          "4.action": req.body
        });
      } else {
        await transaction.rollback();
        res.status(200).json({
          access: "failed",
          message: messages[language]?.nodata,
          data: [],
        });
      }
    }
  } catch (error) {
    await transaction.rollback();
    res.status(404).json({
      message: error,
    });
  }
}
controller.selectItemMasterByCode = async function (req, res) {
  try {
    const language = req.body.language_POST;
    var code = req.body.code_POST;

    const selectitemMasterData = await model.log_item_master.findAll({
      attributes: ["code_category", "code_item", "name", "uom", "status"],
      where: {
        code_item: code
      },
    });
    if (selectitemMasterData.length > 0) {
      return res.status(200).json({
        access: "success",
        data: selectitemMasterData,
      });
    } else {
      return res.status(200).json({
        access: "failed",
        message: messages[language]?.nodata,
        data: [],
      });
    }
  } catch (error) {
    // Tangani error
    return res.status(500).json({
      message: error.message,
    });
  }
}
controller.selectItemMasterByCodeName = async function (req, res) {
  try {
    const language = req.body.language_POST;
    const description = req.body.code_POST;

    // Cari berdasarkan 'name' terlebih dahulu
    let selectitemMasterData = await model.log_item_master.findAll({
      attributes: ["code_category", "code_item", "name", "uom", "status"],
      where:
      {
        [Op.and]: [{ name: { [Op.like]: `%${description}%` } }, { status: 0 }]
      },
    });

    // Jika tidak ditemukan, cari berdasarkan 'code_item'
    if (selectitemMasterData.length === 0) {
      // Cek apakah description adalah angka valid
      if (/^\d+$/.test(description)) { // Regex untuk memeriksa apakah hanya berisi angka
        const codeItem = parseInt(description, 10);
        selectitemMasterData = await model.log_item_master.findAll({
          attributes: ["code_category", "code_item", "name", "uom", "status"],
          where: {
            [Op.and]: [{ code_item: codeItem }, { status: 0 }],
          },
        });
      }
    }

    // Respon berdasarkan hasil pencarian
    if (selectitemMasterData.length) {
      return res.status(200).json({
        access: "success",
        data: selectitemMasterData,
      });
    } else {
      return res.status(200).json({
        access: "failed",
        message: messages[language]?.nodata || "No data found",
        data: [],
      });
    }
  } catch (error) {
    // Tangani error
    return res.status(500).json({
      message: error.message,
    });
  }
};
controller.updateItemMaster = async function (req, res) {
  const transaction = await koneksi.transaction()
  try {
    const language = req.body.language_POST
    const username = req.body.username_POST
    const itemCode = req.params.id
    const category = req.body.category_POST
    const description = req.body.description_POST
    const uom = req.body.uom_POST
    const status = req.body.status_POST
    let updateItemMasterData = await model.log_item_master.update(
      {
        code_category: category,
        name: description,
        uom: uom,
        status: status,
      },
      {
        where:
        {
          code_item: itemCode,
        },
        transaction: transaction
      },
    );
    if (updateItemMasterData) {
      await transaction.commit();
      res.status(200).json({
        access: "success",
        message: messages[language]?.updateData,
        data: updateItemMasterData,
      });
      logger.info('Update Item Master', {
        "1.username": `${username}`,
        "2.module": 'updateItemMaster',
        "3.status": 'success',
        "4.action": req.body
      });
    } else {
      await transaction.rollback();
      res.status(200).json({
        message: messages[language]?.nodata,
        data: [],
      });
    }
  } catch (error) {
    await transaction.rollback();
    res.status(404).json({
      message: error,
    });
  }
}
module.exports = controller;
