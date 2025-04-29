import { Express ,Router} from "express";
import { register, submit } from "../controller/userController";
const router = Router()

router.post('/user', register)
router.post('/submit',submit)

export default router