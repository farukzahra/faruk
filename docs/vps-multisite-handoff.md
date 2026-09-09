# Handoff — VPS multisite (reboot / resiliência)

**Data:** 2026-09-09  
**Contexto:** `faruk.dev.br` ficou 502 após reboot da VPS em 07/set/2026. Este doc passa o estado da investigação para outro agente ou sessão.

---

## O que aconteceu

| Item | Detalhe |
|------|---------|
| **Sintoma** | https://www.faruk.dev.br/ → 502 Bad Gateway |
| **Causa** | Reboot da VPS (~13:12 UTC 07/set). Caddy voltou; **Node do faruk (:3000) não** |
| **Por quê só o faruk** | Único app em `/opt/faruk` rodando com `nohup node server.js` — sem systemd, sem Docker |
| **Correção manual** | Reinício do Node + criação/enable de `faruk.service` na VPS |
| **Correção no repo** | `deploy/faruk.service` + `scripts/deploy-vps.sh` instala/enabled systemd no deploy |

---

## Estado atual da VPS

| Recurso | Host | Path / nota |
|---------|------|-------------|
| SSH | `root@66.23.231.218` | Chave: `C:/repo/secrets/vps/ssh/github-actions-vps-shared` |
| Faruk app | `/opt/faruk` | `systemctl status faruk` — **enabled** (corrigido na sessão) |
| Log faruk | `/var/log/faruk.log` | Erros Gmail: `Send error: invalid_grant` |
| Caddy | systemd | `caddy.service` — enabled, reverse_proxy → :3000 |
| Docker | systemd | `docker.service` — enabled |

### Apps em `/opt/`

```
blog, farmando-aura, faruk, financeiro, fumei-site, job-hunter, maco, ms-poc, nfe_bot, terapia
```

| App | Runtime | Sobrevive reboot? | Notas |
|-----|---------|-------------------|-------|
| **faruk** | Node bare + systemd | **Sim** (após fix) | Antes: só nohup |
| **financeiro** | Docker | **Sim** | `restart: unless-stopped` típico |
| **nfe_bot** | Docker | **Sim** | |
| **terapia** | Docker | **Sim** | confirmado `unless-stopped` |
| **maco, ms-poc, blog** | Docker | **Provável** | auditar `grep restart` em cada `docker-compose.yml` |
| **job-hunter** | ? | **Não verificado** | `job.faruk.dev.br` retornou 404 (porta 8083 down) — problema separado |
| **farmando-aura, fumei-site** | ? | **Não auditado** | |

**Conclusão:** risco de reboot era **específico do faruk**. Demais sites Docker devem subir quando `docker.service` inicia, **se** `restart: unless-stopped` (ou equivalente) estiver no compose.

---

## Pendências para o próximo agente

### 1. Validar pós-deploy do commit 1.8.6

Após push em `main` e GitHub Actions verde:

```bash
ssh -i C:/repo/secrets/vps/ssh/github-actions-vps-shared root@66.23.231.218 \
  'systemctl is-enabled faruk; systemctl is-active faruk; curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/health'
```

Confirmar que `deploy-vps.sh` recriou `/etc/systemd/system/faruk.service` a partir de `deploy/faruk.service`.

### 2. Auditoria completa de restart policy (VPS)

Rodar na VPS (bash, não PowerShell com `$` escapado):

```bash
for d in /opt/*/docker-compose.yml; do
  echo "=== $(dirname $d) ==="
  grep -E 'restart:|container_name' "$d" | head -5
done
systemctl is-enabled caddy docker faruk
docker ps --format 'table {{.Names}}\t{{.Status}}'
```

Documentar apps **sem** `restart: unless-stopped` e corrigir nos respectivos repos.

### 3. job-hunter 404

- URL: `job.faruk.dev.br` (Caddy)
- Sintoma: 404, porta 8083 não escutando
- **Não** causado pelo reboot do faruk — investigar repo `job-hunter` e compose na VPS

### 4. Checklist pós-reboot (opcional, multisite)

Criar em `C:/repo/secrets/vps/` ou no guia do financeiro:

1. `systemctl is-active caddy docker faruk`
2. `docker ps` — todos os containers `Up`
3. Smoke HTTP: faruk, financeiro, nfe, terapia, maco, etc.
4. `curl https://www.faruk.dev.br/api/email-health` → `"ok":true`

### 5. Gmail OAuth (faruk — já tratado no repo)

- Token renovado na sessão; produção OK
- Usuário deve confirmar **Publish app** no [Google Cloud OAuth](https://console.cloud.google.com/auth/audience?project=110995015738) se ainda em Testing
- Não rodar `google:auth` sem `--force` se token válido (`npm run gmail:status:prod`)

---

## Comandos úteis

```bash
# SSH
ssh -i C:/repo/secrets/vps/ssh/github-actions-vps-shared root@66.23.231.218

# Logs faruk
tail -100 /var/log/faruk.log

# Reinício faruk
systemctl restart faruk

# Caddy
systemctl status caddy
cat /etc/caddy/Caddyfile
```

---

## Referências no repo faruk

| Arquivo | Função |
|---------|--------|
| `deploy/faruk.service` | Unit systemd |
| `scripts/deploy-vps.sh` | Instala systemd no deploy |
| `scripts/sync-gmail-to-production.ps1` | Usa `systemctl restart faruk` |
| `AGENTS.md` | VPS — acesso e logs |
| `docs/commit-push.json` | `productionUrl`: https://www.faruk.dev.br |

Guia multisite completo (outro repo): `../financeiro/planos/guia-deploy-vps.local.md`
