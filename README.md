# Medley

App web em português para montar sequências de músicas a partir de uma primeira escolha. React + Vite, servidor Express e armazenamento local no navegador.

## Executar

Requer Node.js 24 e npm 11 (versões usadas na validação).

```sh
cd /workspace/medley
npm ci --cache /workspace/.npm
npm run dev
```

O servidor usa a porta 3000, ajustável por `PORT`. Para produção: `npm run build` e `npm start`. A API e a interface usam a mesma origem.

## Fluxo

1. Importe um link público do Cifra Club ou adicione músicas manualmente.
2. Confira os títulos, tons e BPM; estes metadados não são inferidos do áudio.
3. Escolha a música inicial e a quantidade (2–6).
4. Gere, revise, salve e exporte a sequência em texto.

Os exemplos têm tons e BPM ilustrativos. A primeira importação remove os exemplos, preserva entradas manuais e evita duplicatas por URL. Biblioteca e medleys ficam somente no `localStorage` deste navegador; não há conta ou sincronização entre dispositivos.

## Integração Cifra Club — estado atual

O formulário vem preenchido com a lista solicitada: `https://www.cifraclub.com/@13487389/repertorio/14171923/`.

`POST /api/import` recebe `{ "url": "https://www.cifraclub.com/..." }`. O servidor busca HTML público e extrai links de músicas. Não há uso de API oficial, autenticação, coleta de senha ou acesso a listas privadas. Importação de listas carregadas por JavaScript pode exigir outro adaptador após inspecionar a página real. A heurística de links pode incluir links de recomendações; revise o resultado.

**A lista real não pôde ser validada neste ambiente:** a política de saída retorna HTTP 403 no túnel HTTPS antes de alcançar o Cifra Club. Os domínios `.com` e `.com.br`, com e sem `www`, foram adicionados ao rascunho das configurações do ambiente. Após salvar/aplicar a configuração, testar novamente a importação real. A demonstração não representa a biblioteca do usuário.

URLs e cada redirecionamento são restritos aos quatro hosts exatos HTTPS, sem credenciais ou portas arbitrárias. Há timeout, limite de resposta de 2 MB e limite de 3 importações simultâneas. O proxy herdado e a validação TLS são preservados. Para exposição pública multiusuário, adicionar autenticação e limites por usuário.

## Critérios de medley

Sequência gulosa: mantém a música escolhida e ordena a próxima por compatibilidade com a anterior, sem repetições. Mesmo tom: 70 pontos; relativos: 60; quarta/quinta no mesmo modo: 45; outros tons: 10. BPM conhecido adiciona até 30 pontos, descontando a diferença. Dados ausentes não recebem pontos. Empates usam o título. Isto é sugestão harmônica e de andamento, não análise de letra, áudio ou garantia de qualidade musical.

## Verificação

```sh
npm test
npm run build
# Com o servidor iniciado e Chromium disponível em /usr/bin/chromium:
mkdir -p /workspace/artifacts
npm run test:browser
```

Testes unitários cobrem seleção, tonalidade relativa, andamento, dados ausentes, URLs e parser de HTML sintético. O teste de navegador usa sessão isolada, verifica geração, salvamento, persistência, entrada manual, erro de URL e layout móvel; screenshots ficam em `/workspace/artifacts`. Não substitui a validação da lista real.

`GET /api/health` retorna `{ "ok": true }`.

## Ler uma música e escolher o próximo trecho do medley

A tela inicial agora é **Ler e combinar**. Use **Colar nova música**, informe título, letra/cifra e, se conhecidos, tom e BPM. **Salvar e ler** abre a leitura e compara a música às demais da biblioteca. Para enriquecer sugestões temáticas, adicione letras a pelo menos duas músicas. Também é possível selecionar qualquer música existente e usar **Editar letra e dados**.

As opções ao lado explicam os critérios encontrados. **Continuar com esta** acrescenta a música à sequência, abre sua letra e recalcula sugestões, excluindo músicas já usadas. **Salvar sequência** guarda o medley em Meus medleys. As letras permanecem no navegador; nenhum serviço externo recebe esse texto. A sequência em montagem é temporária até salvar.

A análise temática é uma heurística local de palavras-chave em português (adoração, confiança, amor, gratidão, esperança, entrega, presença e salvação). Não é IA semântica e pode não compreender contexto, negação ou temas fora desse vocabulário. Temas compartilhados adicionam 30 pontos cada (máximo 60); acordes exatos compartilhados adicionam 5 (máximo 20), além da compatibilidade musical. Reconhecemos acordes em linhas exclusivas ou entre colchetes. O tom não é inferido dos acordes. Sugestões de transição são orientações para ensaio, não arranjos gerados nem trechos de letras.

A colagem manual funciona sem Cifra Club. A importação de letras por URL ainda não está implementada; o importador anterior busca somente links de músicas de listas públicas.
