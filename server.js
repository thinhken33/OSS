const express = require("express");
const path = require("path");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/tasks", taskRoutes);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});