FROM dunglas/frankenphp:php8.3-bookworm

RUN install-php-extensions \
    pdo_pgsql \
    mbstring \
    bcmath \
    intl \
    opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader

RUN mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

RUN chmod -R 775 storage bootstrap/cache

RUN php artisan config:clear

EXPOSE 10000

CMD ["sh", "-c", "php artisan migrate --force && frankenphp php-server --listen :${PORT:-10000} --root public"]