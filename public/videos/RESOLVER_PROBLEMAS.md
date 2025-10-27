# 🔧 RESOLVER PROBLEMAS - PÁGINA DE LOGIN

## 🎬 **Problema: Vídeo não aparece**

### ✅ **Soluções:**

#### 1. **Verificar Console do Navegador**

- Acesse `/embaixadores/login`
- Pressione F12 → Console
- Procure por mensagens de erro ou logs dos vídeos

#### 2. **Testar Arquivo de Teste**

- Acesse: `/videos/teste-video.html`
- Verifique se os vídeos aparecem na página de teste
- Se funcionar no teste, o problema é na página de login

#### 3. **Verificar Arquivos**

```bash
# Testar se os vídeos estão acessíveis
curl -I http://localhost:3010/videos/soccer-background.mp4
curl -I http://localhost:3010/videos/soccer-background-mobile.mp4
```

#### 4. **Limpar Cache**

- Ctrl+F5 (Windows)
- Cmd+Shift+R (Mac)
- Ou limpar cache nas DevTools

#### 5. **Verificar Formato dos Vídeos**

- Os vídeos devem ser MP4 com codec H.264
- Tamanho máximo: Desktop 10MB, Mobile 5MB
- Resolução: Desktop 1920x1080, Mobile 720x1280

## 📱 **Problema: Sidebar mobile não redireciona**

### ✅ **Soluções:**

#### 1. **Verificar Header Component**

- O componente Header está correto
- Links para `/embaixadores` estão funcionando
- Navegação mobile está implementada

#### 2. **Testar Navegação**

- Abrir menu mobile (hambúrguer)
- Clicar em "Embaixadores"
- Verificar se redireciona para `/embaixadores`

#### 3. **Verificar Rotas**

- A página `/embaixadores` deve estar funcionando
- Se der erro 500, há problema na página principal

## 🧪 **Debug e Testes**

### **Página de Teste de Vídeo:**

- URL: `/videos/teste-video.html`
- Mostra ambos os vídeos com controles
- Indica status de carregamento
- Logs no console para debug

### **Debug na Página de Login:**

- Em desenvolvimento, mostra info de debug no canto superior direito
- Indica se é mobile ou desktop
- Mostra status do vídeo
- Mostra dimensões da tela

### **Console Logs:**

- `🎬 Carregando vídeo desktop...`
- `✅ Vídeo desktop carregado!`
- `📱 Carregando vídeo mobile...`
- `✅ Vídeo mobile carregado!`
- `❌ Erro no vídeo: [mensagem]`

## 🚨 **Se Nada Funcionar**

### **Solução Temporária:**

A página funcionará com fundo escuro se o vídeo falhar.

### **Solução Definitiva:**

1. Converter vídeos para MP4 H.264
2. Reduzir tamanho dos arquivos
3. Verificar permissões dos arquivos
4. Testar em navegador diferente

## 📋 **Checklist de Verificação**

- [ ] Vídeos existem em `/public/videos/`
- [ ] Arquivos são MP4 válidos
- [ ] Página de teste funciona
- [ ] Console não mostra erros
- [ ] Sidebar mobile funciona
- [ ] Página `/embaixadores` carrega
- [ ] Cache limpo
- [ ] Navegador atualizado

## 💡 **Dicas Importantes**

1. **Sempre verificar o console primeiro**
2. **Usar a página de teste para isolar problemas**
3. **Testar em diferentes navegadores**
4. **Verificar se é problema de vídeo ou de código**
5. **O fallback garante que a página sempre funcione**
