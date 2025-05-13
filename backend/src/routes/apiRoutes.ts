import { Express ,Router} from "express";
import { login, problem, register, submit } from "../controller/userController";
const router = Router()

router.post('/user/register', register)
router.post ('/user/login',login)
router.post('/submit',submit)
router.get('/problems',problem)

export default router