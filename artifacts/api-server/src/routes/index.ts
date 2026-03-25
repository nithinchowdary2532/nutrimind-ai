import { Router, type IRouter } from "express";
import healthRouter from "./health";
import nutritionRouter from "./nutrition";
import anthropicRouter from "./anthropic";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/nutrition", nutritionRouter);
router.use("/anthropic", anthropicRouter);

export default router;
