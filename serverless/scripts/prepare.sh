#!/usr/bin/env bash

set -e
set -x

yarn dotenv
yarn openapi
{% if persistence == 'dynamodb' %}
yarn types
yarn dynamodb
{% endif %}
yarn tsoa
yarn build
