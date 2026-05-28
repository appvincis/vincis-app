# Guia de Testes: Integração AbacatePay (PIX)

Fala equipe! A integração completa com a AbacatePay e os Webhooks já está funcionando 100%. 
Para que vocês consigam testar o fluxo de ponta a ponta na máquina de vocês, sigam os passos abaixo.

## 1. Configurar a Chave da API
Você precisa ter a chave de testes da AbacatePay no seu ambiente local.

1. Crie ou abra o arquivo `apps/api/.env`
2. Adicione a chave (peça a chave atual no grupo ou crie a sua no painel):
```env
ABACATEPAY_API_KEY="abc_dev_..."
```

## 2. Configurar o Recebimento do Webhook
Como a AbacatePay não consegue enviar dados para o seu `localhost` diretamente, nós instalamos uma ferramenta chamada **Smee.io**, que cria um túnel infinito e fixo.

1. Acesse o [Painel da AbacatePay](https://dash.abacatepay.com/app/webhooks) (na conta de Dev).
2. Na aba de **Webhooks**, verifique se a URL cadastrada é esta (se não for, atualize):
   👉 `https://smee.io/vincis-webhook-teste`
3. Garanta que o evento `billing.paid` está selecionado.

## 3. Rodar o Sistema
Agora você precisa rodar tanto a aplicação quanto o túnel do Webhook.

1. No seu terminal principal, rode o projeto normalmente:
   ```bash
   npm run dev
   ```
2. Abra um **segundo terminal**, navegue até a pasta da API e rode o túnel:
   ```bash
   cd apps/api
   npm run webhook:dev
   ```
   *(Ele vai ficar rodando e escutando a URL do Smee)*

## 4. Testar o Fluxo na Prática
1. Abra o **Vincis** no navegador (`http://localhost:5173`).
2. Vá até a tela de **Planos** e clique em **Assinar Premium**.
3. Você será redirecionado para o Checkout oficial (Dev Mode) da AbacatePay.
4. Simule o pagamento clicando no botão disponível na tela deles.
5. Assim que pagar, volte para a tela do app (ou aguarde o redirecionamento).
6. Observe o terminal da API: você verá um aviso de `[Webhook Recebido]` e o seu usuário sendo atualizado para Premium!
7. Na tela do Vincis, tudo ficará dourado! 🎉

---
> [!TIP]
> **Se não atualizar na hora**: Faça Logout e Login novamente (ou dê um F5) para limpar a memória do navegador e puxar os dados atualizados do banco!
