const express = require("express");
const hbs = require("hbs");
const path = require("path");
const rateLimit=require("express-rate-limit");
const apicache=require("apicache");

const app = express();
const weatherData = require("../utils/weatherData");

const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, "../public");

const viewsPath = path.join(__dirname, "../templates/views");

const partialsPath = path.join(__dirname, "../templates/partials");

const limiter=rateLimit({
    max: 5,
    windowMS: 1000*60,
    message: "Status 429"
})

app.use("/api", limiter);

let cache=apicache.middleware;

app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);
app.use(express.static(publicPath));

app.get("/", cache('5 minutes'), (req, res) => {
  res.render("index", { title: "Weather App" });
});

app.get("/weather", (req, res) => {
  if (!req.query.address) {
    return res.send("Address is required");
  }
  weatherData(req.query.address, (error, result) => {
    if (error) {
      return res.send(error);
    }

    res.send(result);
  });
});

app.get("*", (req, res) => {
  res.render("404", { title: "Page not found" });
});

app.listen(port, () => {
  console.log("Server is listening on port " + port);
});