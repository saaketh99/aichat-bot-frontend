FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache wget

# Read backend URL from .env via --build-arg
# GitHub Actions passes this from the secret/env variable
ARG VITE_API_BASE_URL

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Inject the actual backend URL into nginx.conf replacing the placeholder
RUN sed -i "s|BACKEND_PLACEHOLDER|${VITE_API_BASE_URL}|g" /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://localhost:80 || exit 1
CMD ["nginx", "-g", "daemon off;"]