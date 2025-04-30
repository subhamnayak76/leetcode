import { Express ,Router} from "express";
import { login, register, submit } from "../controller/userController";
const router = Router()

router.post('/user/register', register)
router.post ('/user/login',login)
router.post('/submit',submit)

export default router