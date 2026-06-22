/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'postgres' é um pacote server-only; garante que não vá para o bundle do cliente.
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
