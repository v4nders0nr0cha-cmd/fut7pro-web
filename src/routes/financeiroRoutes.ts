import { Router } from "express";
import * as ctrl from "../controllers/financeiroController";
import catchAsync from "../utils/catchAsync";

const router = Router();

router.get("/superadmin/rachas-financeiro", catchAsync(ctrl.getRachas));
router.get(
  "/superadmin/racha-financeiro/:rachaId",
  catchAsync(ctrl.getRachaDetalhe),
);
router.get("/superadmin/financeiro/metrics", catchAsync(ctrl.getMetrics));
router.post(
  "/superadmin/racha-financeiro/:rachaId/financeiros",
  catchAsync(ctrl.postFinanceiro),
);
router.patch(
  "/superadmin/racha-financeiro/:rachaId/status",
  catchAsync(ctrl.patchRachaStatus),
);
router.get("/superadmin/financeiro/export", catchAsync(ctrl.exportFinanceiro));

export default router;
