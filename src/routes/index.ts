import { Router } from "express";
import australia from "./australia"

const router = Router();

router.get('/', (req, res) => {
    res.status(200).json({
        status: 200,
        message: "OK"
    });
});

router.use(australia)

export default router;