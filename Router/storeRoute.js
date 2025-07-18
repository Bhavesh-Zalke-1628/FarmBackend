import { Router } from "express";
import { isLoggedIn, verifyJwt } from "../Middlerware/authMiddleWare.js"
import { createStore, deleteStore, getAllStore, getStoreById, updateStore } from "../Controller/storeController.js";

const router = Router();

router.route('/create-store').post(isLoggedIn, createStore);
router.route('/get-store/:id').get(getStoreById);
router.route('/get-all-store').get(getAllStore);
router.route('/update-store/:id').put(updateStore);
router.route('/delete-store/:id').delete(deleteStore);


export default router;