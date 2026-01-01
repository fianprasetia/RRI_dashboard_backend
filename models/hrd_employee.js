const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_department = require("./hrd_department")
const hrd_job_title = require("./hrd_job_title")
const adm_company = require("./adm_company")
const hrd_catu = require("./hrd_catu")
const hrd_education = require("./hrd_education")
const hrd_employee_type = require("./hrd_employee_type")
const hrd_religion = require("./hrd_religion")
const hrd_employee_status = require("./hrd_employee_status")
const hrd_employee_tax = require("./hrd_employee_tax")
const hrd_grade = require("./hrd_grade")
const hrd_employee_marital = require("./hrd_employee_marital");
const hrd_gender = require("./hrd_gender");
const hrd_employee_salary = require("./hrd_employee_salary");
const hrd_employee = koneksi.define( 
  "hrd_employee",
  {
    employee_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    department_code: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "hrd_department",
        key: "department_code"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    code_company: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "adm_company",
        key: "code_company"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    code_education: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_education",
        key: "code_education"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    id_job_title: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_job_title",
        key: "id_job_title"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    employee_type_code: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_employee_type",
        key: "employee_type_code"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    catu_code: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "hrd_catu",
        key: "catu_code"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    code_religion: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_religion",
        key: "code_religion"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    code_employee_status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_employee_status",
        key: "code_employee_status"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    employee_tax_code: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "hrd_employee_tax",
        key: "employee_tax_code"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    grade_code: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "hrd_grade",
        key: "grade_code"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    marital_code: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_employee_marital",
        key: "marital_code"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    worksite: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "adm_company",
        key: "code_company"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    gender_code: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "hrd_gender",
        key: "gender_code"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    employee_salary_code: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_employee_salary",
        key: "employee_salary_code"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    fullname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    place_of_birth: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    date_of_birth: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    nationality: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    wedding_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    blood_type: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    province: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    city: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    zip_code: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    no_telepon: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    mobile_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    bank_account_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    bank: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    passport_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    family_card_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    identity_card_number: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    emergency_contact_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    date_of_joining: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    date_of_appointment: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    date_of_exit: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    number_of_children: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    number_of_dependents: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    tax_identification_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    health_insurance_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    reception_location: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    personal_email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    business_email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    employment_insurance_purposes: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    drivers_license_number: {
      type: Sequelize.BIGINT,
      allowNull: true,
    },
    photo: {
      type: Sequelize.STRING,
      allowNull: true,
    },

  },
  {
    freezeTableName: true,
  }
);
hrd_employee.belongsTo(hrd_department, { foreignKey: "department_code" });
hrd_employee.belongsTo(adm_company, { foreignKey: "code_company" });
hrd_employee.belongsTo(adm_company, { foreignKey: "worksite", as: "WorksiteCompany" });
hrd_employee.belongsTo(hrd_catu, { foreignKey: "catu_code" });
hrd_employee.belongsTo(hrd_education, { foreignKey: "code_education" });
hrd_employee.belongsTo(hrd_job_title, { foreignKey: "id_job_title" });
hrd_employee.belongsTo(hrd_employee_type, { foreignKey: "employee_type_code" });
hrd_employee.belongsTo(hrd_religion, { foreignKey: "code_religion" });
hrd_employee.belongsTo(hrd_employee_status, { foreignKey: "code_employee_status" });
hrd_employee.belongsTo(hrd_employee_tax, { foreignKey: "employee_tax_code" });
hrd_employee.belongsTo(hrd_grade, { foreignKey: "grade_code" });
hrd_employee.belongsTo(hrd_employee_marital, { foreignKey: "marital_code" });
hrd_employee.belongsTo(hrd_gender, { foreignKey: "gender_code" });
hrd_employee.belongsTo(hrd_employee_salary, { foreignKey: "employee_salary_code" });
module.exports = hrd_employee;
