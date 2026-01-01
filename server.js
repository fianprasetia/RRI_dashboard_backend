// Load required modules
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const cluster = require('cluster');
const os = require('os');
const numCPUs = os.cpus().length;
const rateLimit = require('express-rate-limit');

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });

} else {
  const validateToken = require('./middleware/verifyToken');

  const app = express();


  const corsOptions = {
    origin: '*', // Ganti dengan origin yang tepat
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [], // header tambahan yang ingin diexpose ke client
    credentials: false // set true jika menggunakan cookies/session
  };
  // app.use(cors());
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message: "Too many requests from this IP, please try again later.",
  });
  app.use(limiter);

  app.use(logger('dev'));

  // app.use(bodyParser.json());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(cookieParser());

  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/img/employee', express.static(path.join(__dirname, 'assets/image/employee')));
  app.use('/log', express.static(path.join(__dirname, 'assets/log')));

  const routes = [
    ['/', require('./routes/index')],
    ['/employee', validateToken, require('./routes/employee')],
    ['/grade', validateToken, require('./routes/grade')],
    ['/catu', validateToken, require('./routes/catu')],
    ['/religion', validateToken, require('./routes/religion')],
    ['/approval', validateToken, require('./routes/approval')],
    ['/approvaltransactions', validateToken, require('./routes/approval_transaction')],
    ['/approvaltype', validateToken, require('./routes/approval_type')],
    ['/gender', validateToken, require('./routes/gender')],
    ['/jobtitle', require('./routes/job_title')],
    // ['/jobtitle/bylanguage', require('./routes/job_title')],
    ['/employeesalary', validateToken, require('./routes/employee_salary_system')],
    // ['/employeesalary/bylanguage', require('./routes/employee_salary_system')],
    ['/employeestatustax', validateToken, require('./routes/employee_status_tax')],
    // ['/employeestatustax/bylanguage', require('./routes/employee_status_tax')],
    ['/employeestatus', validateToken, require('./routes/employee_status')],
    ['/employeemarital', validateToken, require('./routes/employee_marital')],
    ['/employeetype', validateToken, require('./routes/employee_type')],
    ['/education', validateToken, require('./routes/education')],
    ['/department', validateToken, require('./routes/department')],
    ['/login', require('./routes/login')],
    ['/company', validateToken, require('./routes/company')],
    ['/companytype', validateToken, require('./routes/company_type')],
    ['/token', require('./routes/token')],
    ['/menu', validateToken, require('./routes/menu')],
    ['/menumobile', validateToken, require('./routes/menu_mobile')],
    ['/language', validateToken, require('./routes/language')],
    ['/attendance', validateToken, require('./routes/attendance_machine')],
    ['/attendanceemployee', validateToken, require('./routes/attendance_employee')],
    ['/users', validateToken, require('./routes/users')],
    ['/workinghours', validateToken, require('./routes/working_hours')],
    ['/employeeassign', validateToken, require('./routes/employee_assign')],
    ['/employeeassignreport', validateToken, require('./routes/employee_assign_report')],
    ['/itemmaster', validateToken, require('./routes/item_master')],
    ['/itemcategory', validateToken, require('./routes/item_category')],
    ['/purchaserequest', validateToken, require('./routes/purchase_request')],
    ['/purchaserequestapproval', validateToken, require('./routes/purchase_request_approval')],
    ['/partners', validateToken, require('./routes/partners')],
    ['/partnerstype', validateToken, require('./routes/partners_type')],
    ['/termofpayment', validateToken, require('./routes/term_of_payment')],
    ['/receivinglocations', validateToken, require('./routes/receiving_locations')],
    ['/purchaserequestquotation', validateToken, require('./routes/purchase_request_quotation')],
    ['/purchaseorder', validateToken, require('./routes/purchase_order')],
    ['/posting', validateToken, require('./routes/posting')],
    ['/postingtype', validateToken, require('./routes/posting_type')],
    ['/signature', validateToken, require('./routes/signature')],
    ['/coa', validateToken, require('./routes/coa')],
    ['/goodsreceiptwarehouse', validateToken, require('./routes/goods_receipt_warehouse')],
    ['/goodsreceiptasset', validateToken, require('./routes/goods_receipt_asset')],
    ['/goodsreceiptapproval', validateToken, require('./routes/goods_receipt_approval')],
    ['/assettype', validateToken, require('./routes/asset_type')],
    ['/assetsubtype', validateToken, require('./routes/asset_subtype')],
    ['/asset', validateToken, require('./routes/asset')],
    ['/warehouse', validateToken, require('./routes/warehouse')],
    ['/activitytype', validateToken, require('./routes/activity_type')],
    ['/activity', validateToken, require('./routes/activity')],
    ['/purchaserequestreport', validateToken, require('./routes/purchase_request_report')],
    ['/trialbalancereport', validateToken, require('./routes/trial_balance_report')],
    ['/journal', validateToken, require('./routes/journal')],
    ['/goodsissue', validateToken, require('./routes/goods_issue')],
    ['/goodsissueapproval', validateToken, require('./routes/goods_issue_approval')],
    ['/paymentvouchertype', validateToken, require('./routes/payment_voucher_type')],
    ['/accountingperiods', validateToken, require('./routes/accounting_periods')],
    ['/paymentvoucher', validateToken, require('./routes/payment_voucher')],
    ['/bankaccount', validateToken, require('./routes/bank_account')],
    ['/cashbank', validateToken, require('./routes/cash_bank')],
    ['/transactionunposting', validateToken, require('./routes/transaction_unposting')],
    ['/seedtype', validateToken, require('./routes/seed_type')],
    ['/blockmaster', validateToken, require('./routes/block_master')],
    ['/harvestpenaltytype', validateToken, require('./routes/harvest_penalty_type')],
    ['/harvestpenalty', validateToken, require('./routes/harvest_penalty')],
    ['/harvestincentive', validateToken, require('./routes/harvest_incentive')],
    ['/averagebunchrate', validateToken, require('./routes/average_bunch_rate')],
    ['/basicsalary', validateToken, require('./routes/basic_salary')],
    ['/holiday', validateToken, require('./routes/holiday')],
    ['/natura', validateToken, require('./routes/natura')],
    ['/estateactivity', require('./routes/estate_activity')],
    ['/factoryoperations', require('./routes/mill_operations')],
    ['/download-test-file.bin', require('./routes/download')],
    ['/protected-route', validateToken, (req, res) => res.json({ message: 'Access granted', user: req.user })]

  ];

  routes.forEach(([path, ...middleware]) => {
    app.use(path, ...middleware);
  });

  // 404 handler
  app.use((req, res, next) => {
    next(createError(404));
  });

  // Error handler
  app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.json({ error: err.message });
  });

  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
