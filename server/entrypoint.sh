#!/bin/sh

# Путь к вашему конфигу внутри контейнера
CONFIG_PATH="/home/omp/mysql.ini"

perl -pe 's/\$\{(\w+)\}/$ENV{$1}/g' /home/omp/mysql.ini.tmpl > /home/omp/mysql.ini
echo "Генерация mysql.ini файла для подключения к базе данных."

# Запускаем основной процесс контейнера
exec "$@"
