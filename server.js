import { app } from "./app.js";
import { config } from "dotenv";
import connectDB from "./DbConnection/DbConnection.js";
config()



connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })