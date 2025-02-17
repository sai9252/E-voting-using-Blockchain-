import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash("1234", 10);
console.log(hashedPassword);