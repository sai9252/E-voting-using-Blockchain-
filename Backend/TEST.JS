import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash("Adim@1234", 10);
console.log(hashedPassword);