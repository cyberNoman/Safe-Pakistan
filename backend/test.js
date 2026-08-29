fetch('http://localhost:3000/analyze/text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Mubarak ho! Apko 25,000 mile hain. OTP bhejein foran warna account band ho jayega.' }),
})
.then(r => r.json())
.then(j => console.log(JSON.stringify(j, null, 2)))
.catch(e => console.error('FAIL:', e.message));