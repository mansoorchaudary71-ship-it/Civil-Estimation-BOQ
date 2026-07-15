const fs = require('fs');
let content = fs.readFileSync('src/lib/estimates.ts', 'utf8');

const authCode = `
import { db, handleFirestoreError, OperationType } from './firebase';

function getUserId() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (e) {
      return null;
    }
  }
  return null;
}
`;

content = content.replace("import { db, handleFirestoreError, OperationType, auth } from './firebase';", authCode);
content = content.replace(/!auth\.currentUser/g, "!getUserId()");
content = content.replace(/auth\.currentUser\.uid/g, "getUserId()");

fs.writeFileSync('src/lib/estimates.ts', content);
