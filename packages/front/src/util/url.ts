export function getServerIp() {
  const config = process.conf;
  return `http://${config.ip}`;
}
