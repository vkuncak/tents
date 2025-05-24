// src/index.ts

// 1. Enums
enum Role {
  Admin = "ADMIN",
  User = "USER",
  Guest = "GUEST",
}

// 2. Interface
interface Person {
  name: string;
  age: number;
  role: Role;
}

// 3. Generic function
function wrapInArray<T>(value: T): T[] {
  return [value];
}

// 4. Class with access modifiers and a method
class UserAccount implements Person {
  // public, private, readonly
  public name: string;
  public age: number;
  public readonly role: Role;
  private loginCount = 0;

  constructor(name: string, age: number, role: Role) {
    this.name = name;
    this.age = age;
    this.role = role;
  }

  login() {
    this.loginCount++;
    console.log(`${this.name} has logged in ${this.loginCount} time(s).`);
  }
}

// 5. Union types and type assertion
type ID = number | string;
function printId(id: ID) {
  // type narrowing
  if (typeof id === "string") {
    console.log("ID (string):", id.toUpperCase());
  } else {
    console.log("ID (number):", id.toFixed(0));
  }
}

// ——— Usage ———

const alice = new UserAccount("Alice", 30, Role.Admin);
alice.login();              // Alice has logged in 1 time(s).
alice.login();              // Alice has logged in 2 time(s).

const numArray = wrapInArray<number>(42);
const strArray = wrapInArray("hello");

console.log(numArray, strArray); 
// [42] ["hello"]

printId("abc123");          // ID (string): ABC123
printId(987654321);         // ID (number): 987654321
