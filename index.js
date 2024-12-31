// const dotenv = require("dotenv");
// dotenv.config();

// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const userRouter = require("./router/User.route");
// const folderRouter = require("./router/Folder.route");
// const cors = require("cors");

// const corsOptions = {
//     origin: "http://localhost:5173",
// }

// app.use(cors(corsOptions));

// app.use(express.json());

// const PORT = process.env.PORT || 4000;

// app.get("/", (req, res) => {
//     res.send("Hello");
// });

// app.use("/api/user", userRouter);
// app.use("/api/folders", folderRouter);

// mongoose.connect(process.env.MONGO_URL)
// .then(() => {
//     app.listen(PORT, () => {
//         console.log(`Server is running on http://localhost:${PORT}`);
//     });
// })
// .catch ((error) => {
//     console.log(`Something went wrong! ${error}`)
// });





const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./router/User.route");
const folderRouter = require("./router/Folder.route");

const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
}

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
    res.send("Hello");
});

app.use("/api/user", userRouter);
app.use("/api/folders", folderRouter);

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
.catch ((error) => {
    console.log(`Something went wrong! ${error}`)
});