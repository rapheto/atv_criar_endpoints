# API Testing Guide — Bolão

## 1. GET /api/matches

List matches with optional filters.

**Query params:**

| Parâmetro | Tipo   | Descrição                                      |
|-----------|--------|------------------------------------------------|
| `stage`   | string | `GRUPOS`, `OITAVAS`, `QUARTAS`, `SEMI`, `FINAL` |
| `status`  | string | `SCHEDULED`, `LIVE`, `FINISHED`                |

**Responses:**

| Código  | Situação             |
|---------|----------------------|
| `200 OK` | Array de `Match`   |

### Curls

```bash
# ✅ 200 — all matches
curl -i "http://localhost:3001/api/matches"

# ✅ 200 — filter by stage
curl -i "http://localhost:3001/api/matches?stage=GRUPOS"

# ✅ 200 — filter by status
curl -i "http://localhost:3001/api/matches?status=SCHEDULED"

# ✅ 200 — filter by stage + status
curl -i "http://localhost:3001/api/matches?stage=GRUPOS&status=SCHEDULED"

# ✅ 200 — other stages
curl -i "http://localhost:3001/api/matches?stage=OITAVAS"
curl -i "http://localhost:3001/api/matches?stage=FINAL"

# ✅ 200 — live matches
curl -i "http://localhost:3001/api/matches?status=LIVE"

# ✅ 200 — finished matches
curl -i "http://localhost:3001/api/matches?status=FINISHED"
```

---

## 2. POST /api/guesses

Create a new guess.

**Body JSON:**

```json
{
  "poolId": 1,
  "participantId": 1,
  "matchId": 2,
  "homeScore": 2,
  "awayScore": 1
}
```

**Responses:**

| Código            | Situação                                                    |
|-------------------|-------------------------------------------------------------|
| `201 Created`     | Palpite criado com sucesso                                  |
| `400 Bad Request` | Campos obrigatórios ausentes                                |
| `404 Not Found`   | Partida ou participante não existe                          |
| `409 Conflict`    | Participante já fez palpite nessa partida / partida já começou |

### Curls

```bash
# ✅ 201 — success
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":1,"matchId":2,"homeScore":2,"awayScore":1}'

# ❌ 400 — missing homeScore and awayScore (use a combo with no existing guess)
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":2,"matchId":2}'

# ❌ 404 — match not found
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":1,"matchId":9999,"homeScore":2,"awayScore":1}'

# ❌ 404 — participant not in pool
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":9999,"matchId":2,"homeScore":2,"awayScore":1}'

# ❌ 409 — duplicate guess (run the 201 curl twice)
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":1,"matchId":2,"homeScore":2,"awayScore":1}'

# ❌ 409 — match already started (requires matchId with kickoffAt in the past)
# First, set a match to the past:
# docker exec -it atv_criar_endpoints-db-1 psql -U postgres -d bolao_db \
#   -c "UPDATE matches SET \"kickoffAt\" = '2020-01-01' WHERE id = 1;"
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":2,"matchId":1,"homeScore":0,"awayScore":0}'
```

---

## 3. PATCH /api/guesses/:id

Edit an existing guess.

**Body JSON:**

```json
{ "homeScore": 3, "awayScore": 0 }
```

**Responses:**

| Código            | Situação                            |
|-------------------|-------------------------------------|
| `200 OK`          | Palpite atualizado                  |
| `400 Bad Request` | Tentativa de editar pós-kickoff     |
| `404 Not Found`   | Palpite não existe                  |

### Curls

```bash
# ✅ 200 — success (use an existing guess id, e.g. 3)
curl -i -X PATCH http://localhost:3001/api/guesses/3 \
  -H "Content-Type: application/json" \
  -d '{"homeScore":3,"awayScore":0}'

# ✅ 200 — update only homeScore
curl -i -X PATCH http://localhost:3001/api/guesses/3 \
  -H "Content-Type: application/json" \
  -d '{"homeScore":1}'

# ❌ 404 — guess not found
curl -i -X PATCH http://localhost:3001/api/guesses/9999 \
  -H "Content-Type: application/json" \
  -d '{"homeScore":3,"awayScore":0}'

# ❌ 400 — match already started (guess id 4 is linked to matchId 1 set to the past)
# First, set a match to the past:
# docker exec -it atv_criar_endpoints-db-1 psql -U postgres -d bolao_db \
#   -c "UPDATE matches SET \"kickoffAt\" = '2020-01-01' WHERE id = 1;"
curl -i -X PATCH http://localhost:3001/api/guesses/4 \
  -H "Content-Type: application/json" \
  -d '{"homeScore":3,"awayScore":0}'
```

---

## 4. DELETE /api/pools/:poolId/participants/:participantId

Remove a participant from a pool.

**Responses:**

| Código           | Situação                          |
|------------------|-----------------------------------|
| `204 No Content` | Removido com sucesso              |
| `404 Not Found`  | Bolão ou participante não existe  |

### Curls

```bash
# ✅ 204 — success
curl -i -X DELETE http://localhost:3001/api/pools/1/participants/2

# ❌ 404 — pool not found
curl -i -X DELETE http://localhost:3001/api/pools/9999/participants/2

# ❌ 404 — participant not in pool
curl -i -X DELETE http://localhost:3001/api/pools/1/participants/9999
```

---

## Tips

Add `-i` to any curl to see the HTTP status code in the response headers:

```bash
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":1,"matchId":2,"homeScore":2,"awayScore":1}'
```

To force a match into the past for testing 400/409 errors:

```bash
docker exec -it atv_criar_endpoints-db-1 psql -U postgres -d bolao_db \
  -c "UPDATE matches SET \"kickoffAt\" = '2020-01-01' WHERE id = 1;"
```
