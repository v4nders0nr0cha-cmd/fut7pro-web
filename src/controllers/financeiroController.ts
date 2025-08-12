import type { Request, Response } from "express";
import * as service from "../services/financeiroService";

// GET /api/superadmin/rachas-financeiro
export const getRachas = async (req: Request, res: Response) => {
  const dados = await service.listarRachasFinanceiro();
  res.json(dados);
};

// GET /api/superadmin/racha-financeiro/:rachaId
export const getRachaDetalhe = async (req: Request, res: Response) => {
  const { rachaId } = req.params;
  if (!rachaId) return res.status(400).json({ error: "rachaId obrigatório" });
  const detalhe = await service.detalheRachaFinanceiro(rachaId);
  if (!detalhe) return res.status(404).json({ error: "Racha não encontrado" });
  res.json(detalhe);
};

// GET /api/superadmin/financeiro/metrics
export const getMetrics = async (req: Request, res: Response) => {
  const metrics = await service.listarMetricsFinanceiro();
  res.json(metrics);
};

// POST /api/superadmin/racha-financeiro/:rachaId/financeiros
export const postFinanceiro = async (req: Request, res: Response) => {
  const { rachaId } = req.params;
  if (!rachaId) return res.status(400).json({ error: "rachaId obrigatório" });
  const financeiro = await service.novoFinanceiro(rachaId, req.body);
  res.json(financeiro);
};

// PATCH /api/superadmin/racha-financeiro/:rachaId/status
export const patchRachaStatus = async (req: Request, res: Response) => {
  const { rachaId } = req.params;
  if (!rachaId) return res.status(400).json({ error: "rachaId obrigatório" });
  const { inadimplente } = req.body;
  const racha = await service.atualizarStatusRacha(rachaId, inadimplente);
  res.json(racha);
};

// GET /api/superadmin/financeiro/export
export const exportFinanceiro = async (req: Request, res: Response) => {
  const { formato, ...filtros } = req.query;
  const relatorio = await service.exportarFinanceiro(formato as string, filtros);
  res.json(relatorio);
};
