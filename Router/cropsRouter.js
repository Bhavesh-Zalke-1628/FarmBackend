
import { Router } from 'express'
import { addCrop, deleteCrop, getCrops, updateCrop } from '../Controller/CropsController.js'
import { isLoggedIn } from '../Middlerware/authMiddleWare.js'

const router = Router()

router.route("/add-crop").post(isLoggedIn, addCrop)
router.route("/get-crops").get(isLoggedIn, getCrops)
router.route("/delete-crop/:cropId").delete(isLoggedIn, deleteCrop)
router.route("/update-crop/:cropId").put(isLoggedIn, updateCrop)


export default router;