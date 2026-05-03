const response = await fetch('https://www.aim2030app.com/api/skip-trace', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    propertyId: 1,
    address: '850 E Jefferson Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90011'
  })
});
const data = await response.json();
console.log(JSON.stringify(data, null, 2));
