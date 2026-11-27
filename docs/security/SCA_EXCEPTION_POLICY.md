# SCA Exception Policy (Fut7Pro Web)

## Objetivo

Definir o fluxo de excecao temporaria para vulnerabilities identificadas no gate SCA (`pnpm audit`/Snyk), sem liberar risco indefinidamente.

## Regra obrigatoria

- Excecao so e permitida quando houver bloqueio tecnico comprovado para upgrade imediato.
- Toda excecao precisa de owner, justificativa e data de expiracao.
- Prazo maximo por excecao: 30 dias corridos.

## Onde registrar

- Arquivo: `security/sca-allowlist.json`
- Formato:

```json
{
  "exceptions": [
    {
      "advisoryId": "GHSA-xxxx-xxxx-xxxx",
      "packageName": "nome-do-pacote",
      "versions": ["1.2.3"],
      "lockfileSha256": "0000000000000000000000000000000000000000000000000000000000000000",
      "dependencyPaths": [".>parent>nome-do-pacote"],
      "scope": "contexto-revisado",
      "evidence": ["src/arquivo-revisado.ts"],
      "owner": "time-ou-responsavel",
      "justification": "motivo tecnico objetivo",
      "expiresOn": "2026-12-11"
    }
  ]
}
```

## Enforcement em CI

- Script: `node scripts/security/validate-sca-allowlist.js`
- Falha quando:
  - campos obrigatorios faltam;
  - `expiresOn` esta expirado;
  - `expiresOn` excede 30 dias.

## Encerramento de excecao

O gate `scripts/security/evaluate-audit.js` bloqueia toda critica e toda alta sem correspondencia exata com uma excecao valida. Mesmo uma critica cadastrada continua bloqueada. Mudanca de versao, advisory ou caminho exige nova revisao. Excecoes vencidas e entradas sem alerta correspondente tambem bloqueiam. Falha de coleta e JSON incompleto nao representam ausencia de vulnerabilidades.

O SHA-256 canonico LF do pnpm-lock.yaml revisado tambem e obrigatorio. Substitua o valor ilustrativo acima pelo hash real. Qualquer mudanca no grafo, inclusive em dependencias pai, exige revisar e renovar essa vinculacao.

Os imports literais dos consumidores que fundamentam as excecoes temporarias sao verificados por `scripts/security/check-reviewed-usage.js`. Esse inventario nao substitui analise geral de fluxo de dados.

A [triagem de 27/11/2026](dependency-triage-20261127.md) documenta as evidencias e os riscos residuais das duas excecoes propostas.

- Remover a entrada da allowlist na mesma PR que corrige a dependencia.
- Registrar evidencia no PR (pacote corrigido + versão aplicada).
