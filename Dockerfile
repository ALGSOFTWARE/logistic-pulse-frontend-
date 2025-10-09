# Stage 1: build da aplicação Vite
FROM node:20-alpine AS builder
WORKDIR /app

# Instalando dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copiando fonte e construindo artefatos
COPY . .
RUN npm run build

# Stage 2: servidor estático com Nginx
FROM nginx:1.27-alpine

# Configuração personalizada para SPA (fallback index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiando build final
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
