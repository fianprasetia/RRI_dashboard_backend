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
    ['/login', require('./routes/login')],
    ['/home', require('./routes/home')],
    ['/mill', require('./routes/mill')],
    ['/download-test-file.bin', require('./routes/download')],
    // ['/protected-route', validateToken, (req, res) => res.json({ message: 'Access granted', user: req.user })]

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

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
