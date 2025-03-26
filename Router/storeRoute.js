import { Router } from "express";
import { authorisedRoles, isLoggedIn, verifyJwt } from "../Middlerware/authMiddleWare.js";
import { createStore, deleteStore, getAllStore, getStoreById, updateStore } from "../Controller/storeController.js";

const router = Router();

router.route('/create-store').post(isLoggedIn, createStore);
router.route('/get-store/:id').get(isLoggedIn, getStoreById);
router.route('/get-all-store').get(isLoggedIn, getAllStore);
router.route('/update-store/:id').put(isLoggedIn, authorisedRoles("store"), updateStore);
router.route('/delete-store/:id').delete(isLoggedIn, verifyJwt, authorisedRoles('store', 'admin'), deleteStore);



export default router;
