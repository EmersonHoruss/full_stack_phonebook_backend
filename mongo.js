const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}
const [_, _2, password, name, number] = process.argv;
const url = `mongodb+srv://peralesvillanuevaemerson:${password}@phonebook.z4dg1n0.mongodb.net/phonebook?retryWrites=true&w=majority`;
mongoose.set('strictQuery', false);
mongoose.connect(url);
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});
const Person = mongoose.model('Person', personSchema);
if (name && number) {
  const person = new Person({
    name,
    number,
  });
  person.save().then(({ name, number }) => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
} else {
  Person.find({}).then((result) => {
    console.log('phonebook:');
    result.forEach(({ name, number }) => {
      console.log(`${name} ${number}`);
    });
    mongoose.connection.close();
  });
}
