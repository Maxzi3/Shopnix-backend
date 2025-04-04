const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const globalErrorHandler = require("./controllers/ErrorController");
const AppError = require("./utils/appError");
const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const cartRouter = require("./routes/cartRoutes");

const app = express();

//GLOBAL  MIDDLEWARES

// Set Security HTTP Headers
app.use(helmet());

// DEVELOPMENT LOGIN
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// LIMIT REQUEST FROM API
const limter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many Request from this IP, Please Try again in an hour",
});
app.use("/api", limter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data Sanitization against NoSQL query Injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: ["duration", "ratingsQuantity", "ratingsAverage"],
  })
);

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Using Express router
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/cart", cartRouter);

app.all("*", (req, ) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
