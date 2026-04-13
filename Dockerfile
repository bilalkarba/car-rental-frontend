# Build stage
FROM node:18 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist/car-rental-frontend /usr/share/nginx/html

# Copy custom nginx config if needed, otherwise default is fine for basic SPA
# For Angular routing to work with Nginx, we usually need a custom config to redirect 404s to index.html
# I will create a simple nginx config and copy it.

# Create a default nginx config for SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
