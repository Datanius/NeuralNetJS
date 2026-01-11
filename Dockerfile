FROM nginx:alpine

# Copy the application files
COPY examples/ /usr/share/nginx/html/examples/
COPY src/ /usr/share/nginx/html/src/
COPY resources/ /usr/share/nginx/html/resources/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
