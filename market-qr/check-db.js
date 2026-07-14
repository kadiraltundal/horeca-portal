const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany().then(r => {
  console.log('Users:', r.length);
  r.forEach(u => console.log(u.email, u.role));
  return p.$disconnect();
}).catch(e => {
  console.error(e);
  process.exit(1);
});
