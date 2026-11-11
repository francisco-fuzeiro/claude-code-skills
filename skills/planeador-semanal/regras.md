# Regras do planeador semanal (config fixa e motor)

Valores que não mudam de semana para semana. Editar aqui quando algo mudar de vez; registar cada regra nova que a pessoa dá ("a partir de agora, X") e confirmar que ficou guardada.

Todos os valores abaixo são exemplos inventados. Troca-os pelos teus.

## Config fixa

| Item | Valor (exemplo) |
|---|---|
| Base (casa) | Bairro A. Ponto de partida e chegada das deslocações. |
| Escritório | Rua B, 10. Passar cá a buscar material antes de quase todos os eventos, salvo indicação em contrário nessa semana. |
| Deslocações | Sempre de carro. Sem rotas em tempo real: estimar pelas moradas e marcar `≈Xmin (estimado)`. Norma = 30min sem melhor estimativa. |
| Hora de sair de casa | Em todos os dias de trabalho = `hora de estar no local − deslocação`. |

**Tempos-base** (estimados; a pessoa corrige): casa↔escritório ≈30min, escritório↔Local C ≈10min, casa↔Local D ≈40min.

## Antecedência de chegada a eventos

`estar_no_local = início − antecedência`; depois recuar a deslocação (e a passagem pelo escritório).

| Tipo de evento | Estar no local antes do início |
|---|---|
| Evento grande | 5h |
| Evento médio | 3h |
| Evento remoto | 2h (sem deslocação ao local) |
| Qualquer evento sem regra própria | mínimo 3h |

Uma hora de chegada dada pela pessoa vence a tabela.

## Duração e fim (calcular sempre a hora de saída)

| Tipo | Duração a assumir |
|---|---|
| Evento com duração conhecida | fim = início + duração; desmontagem 30min depois do fim, 45min em evento grande |
| Sem informação | "hora por confirmar". Não inventar. |

**Saída do dia:** `saída do local = fim + desmontagem`. Com material, depois do local vai ao escritório: `saída do dia = saída do local + deslocação + 20min a descarregar`.

**Dias de preparação:** por omissão, ficar no escritório até às 16:00 se o email não disser outra hora.

## Ginásio

- 2 a 3 vezes por semana, de preferência nas folgas. Dias de semana só depois das 18h.
- 30 a 45min.
- Nunca em dias com dormida fora ou que acabam tarde.

## Estrutura de cada dia (organizar o dia inteiro)

1. **Estar no local.** Hora do email; sem hora, `10:00 (por confirmar)` em dias de preparação.
2. **Sair de casa** = estar no local − tempo-base. Bloco `desloc`.
3. **Passar no escritório a buscar material** antes de cada evento, salvo indicação em contrário.
4. **Refeições (1h)** só quando não está a trabalhar.
5. **Fim do dia:** tempo livre, depois um bloco de projetos pessoais (~1h), depois só `descanso`.
6. **Folga** (dia do intervalo sem tarefa no email): almoço, bloco maior de projetos pessoais, ginásio, jantar, descanso.

**Dia da semana sem linha no email**, fora do intervalo do assunto: perguntar. Em modo sem perguntas: não inventar, deixar de fora e dizê-lo.

**Bloco `descanso` obrigatório** em todos os dias em que dorme em casa, mesmo que chegue de madrugada. Dormida fora: sem ginásio nem descanso nesse dia.

## Motor

- **Eventos:** tipo → antecedência; `estar_no_local = início − antecedência`. Com escritório: `sair_de_casa = estar_no_local − deslocação(escritório→local) − 20min − deslocação(casa→escritório)`. Exemplo: 17:45 − 45 − 20 − 30 → sair às 16:10.
- **Tarefa com hora:** bloco à hora indicada; se exige material, antepor a passagem pelo escritório.
- **Sem hora ou dia de preparação:** bloco sem hora fixa ou `10:00 (por confirmar)`. Sem horas inventadas.
- **Condicionais** ("se houver alterações", "hora a confirmar"): manter com nota visível.
