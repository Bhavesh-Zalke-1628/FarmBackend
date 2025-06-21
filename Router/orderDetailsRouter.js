import { Router } from "express";

const router = Router()

router.route("/create-order-deteails").post(createOrderDetails)


export default router;