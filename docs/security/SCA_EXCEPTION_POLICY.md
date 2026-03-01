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
      "owner": "time-ou-responsavel",
      "justification": "motivo tecnico objetivo",
      "expiresOn": "2026-03-31"
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

- Remover a entrada da allowlist na mesma PR que corrige a dependencia.
- Registrar evidencia no PR (pacote corrigido + versão aplicada).
