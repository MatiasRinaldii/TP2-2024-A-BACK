import getConnection from "./connection.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function addUser(user) {
  const clientmongo = await getConnection();

  if(userExist(user.mail)){
    throw new Error("Usuario existe");
  }
  user.password = await bcryptjs.hash(user.password, 10);

  const result = clientmongo
    .db()
    .collection("users")
    .insertOne(user);

  return result;
  
}

async function userExist(username) {
  const clientmongo = await getConnection();
  const user = await clientmongo
    .db()
    .collection("users")
    .findOne({ username: username });

  return user !== null;
}

export async function findByCredential(email, password) {
  const clientmongo = await getConnection();

  const user = await clientmongo
    .db()
    .collection("users")
    .findOne({ email: email });

  if (!user) {
    throw new Error("Credenciales no validas");
  }

  const isMatch = await bcryptjs.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Credenciales no validas");
  }

  return user;
}

export async function generateAuthToken(user) {
  const token = await jwt.sign(
    { _id: user._id, email: user.email },
    process.env.CLAVE_SECRETA,
    { expiresIn: "1h" }
  );
  return token;
}

export async function getUser(id) {
  const clientmongo = await getConnection();

  const user = await clientmongo
    .db()
    .collection("user")
    .findOne({ _id: new ObjectId(id) });

  return user;
}

export async function updateUser(user) {
  const clientmongo = await getConnection();
  const query = { _id: new ObjectId(user._id) };
  const newValues = {
    $set: {
      mail: user.mail,
      nombre: user.nombre,
      apellido: user.apellido,
      dni: user.dni
    },
  };

  const result = await clientmongo
    .db()
    .collection("user")
    .updateOne(query, newValues);
  return result;
}

