export default function() {
  this.get('/entries', function() {
    return {
      "entries": []
    };
  });

  this.get('/users/me', function() {
    return {
      "user": {
        id: "1234",
        email: 'homersimpson@gmail.com',
        password: 'marge',
        passwordConfirmation: 'marge',
        encryptEntries: false
      }
    };
  });
}
