/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./i18n.js');

const nextConfig = {};

module.exports = withNextIntl(nextConfig);