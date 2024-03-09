import { Router } from "express";

import { healthcheck } from "../controllers/healthCheck.controller.js";
import { jwtVerify } from "../middleware/auth.middleware.js";

const router = Router();
router.use(jwtVerify);

router.route("/").get(healthcheck);

export default router;
