# 🔧 Soluções para Problemas de Vídeo

## Problema: Vídeo não aparece na página de login

### ✅ **Soluções em ordem de prioridade:**

#### 1. **Verificar nomes dos arquivos**

Os vídeos devem estar exatamente com estes nomes:

- `soccer-background.mp4` (para desktop)
- `soccer-background-mobile.mp4` (para mobile)

#### 2. **Verificar formato dos arquivos**

- **MP4**: Formato mais compatível
- **WebM**: Formato alternativo (opcional)
- **Codec**: H.264 para MP4

#### 3. **Verificar tamanho dos arquivos**

- Desktop: Máximo 10MB
- Mobile: Máximo 5MB
- Arquivos muito grandes podem não carregar

#### 4. **Verificar permissões**

- Arquivos devem ter permissão de leitura
- Pasta `/public/videos/` deve ser acessível

#### 5. **Limpar cache do navegador**

- Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)
- Ou limpar cache nas DevTools

#### 6. **Verificar console do navegador**

- F12 → Console
- Procurar por erros 404 ou problemas de CORS

### 🎬 **Se ainda não funcionar:**

#### **Solução temporária:**

A página funcionará normalmente sem vídeo, mostrando apenas o fundo escuro.

#### **Solução definitiva:**

1. Converter vídeo para MP4 com H.264
2. Reduzir resolução se necessário
3. Comprimir para tamanho adequado
4. Testar em navegador diferente

### 📱 **Teste Mobile:**

- Redimensione a janela do navegador para < 768px
- Ou use DevTools → Toggle device toolbar
- O vídeo mobile deve aparecer automaticamente

### 🔍 **Debug:**

```bash
# Verificar se os arquivos estão acessíveis
curl http://localhost:3010/videos/soccer-background.mp4
curl http://localhost:3010/videos/soccer-background-mobile.mp4
```

### 💡 **Dica:**

Se o vídeo não carregar, a página ainda funcionará perfeitamente com o fundo escuro e overlay.
