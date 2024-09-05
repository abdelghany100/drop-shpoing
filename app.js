 const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
dotenv.config({ path: "config.env" });
const { errorHandler, notFound } = require("./middlewares/error");
const cors = require("cors");
const compression = require("compression");

const app = express();
app.use(cors());

// Add compression middleware
app.use(compression());
const DB = process.env.DATABASE_URI.replace("<USER>", process.env.DATABASE_USER)
  .replace("<PASSWORD>", process.env.DATABASE_PASSWORD)
  .replace("<DATABASENAME>", process.env.DATABASE_NAME);

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connection established");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/product", require("./routes/productRoute"));
app.use("/api/category", require("./routes/categoryRoute"));
app.use("/api/cart", require("./routes/CartRoute"));
app.use("/api/favorite", require("./routes/FavoritRoute"));

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server has started on port 8000");
});
