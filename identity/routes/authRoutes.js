import express from "express";
import { addRegisterSchema, addLoginSchema } from "../zodValidators/authSchemas.js";
import { registerUser, loginUser } from "../services/authService.js";

const router = express.Router();

router.get('/test', (req, res) => {
    res.send('Auth route working');
});

const addRegister = async (req, res, next) => {
try {
addRegisterSchema.parse(req.body);
const data = await registerUser(req.body);
return res.status(201).json(data);
} 
catch (err) {
next(err);
}
};

const addLogin = async (req, res, next) => {
try {
const { email, password } = req.body;
addLoginSchema.parse(req.body);
const data = await loginUser({ email, password });
return res.status(200).json(data);
}
catch (err) {
next(err);
}
};

router.post("/register", addRegister);
router.post("/login", addLogin);

export default router;