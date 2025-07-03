import { Router } from "express"
import { getCropAdvice, getFullAnalysis } from "../Controller/cropAdviceController.js"

const router = Router()

router.route("/advice").post(getCropAdvice)
router.route("/analysis").post(getFullAnalysis)


export default router