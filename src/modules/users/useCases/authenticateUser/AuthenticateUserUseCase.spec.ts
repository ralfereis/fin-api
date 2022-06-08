import authConfig from "../../../../config/auth";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {
    authConfig.jwt.secret = "eyJhbGciOiJIUzI1NiJ9.eyJwYXNzIoiMx4";
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
  });

  it("Should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
      name: "any_name",
      email: "any_email",
      password: "any_password",
    };

    await createUserUseCase.execute(user);

    const auth = await authenticateUserUseCase.execute({
      email: user.email,
      password: "any_password",
    });

    expect(auth.user).toHaveProperty("email", user.email);
    expect(auth).toHaveProperty("token");
  });

  it("Should not be able to authenticate an unexistent user", async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: "wrong_email",
        password: "any_password",
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it("Should not be able to authenticate an user with an incorrect password", async () => {
    const user: ICreateUserDTO = {
      name: "any_name",
      email: "any_email",
      password: "any_password",
    };

    await createUserUseCase.execute(user);

    await expect(
      authenticateUserUseCase.execute({
        email: user.email,
        password: "wrong_password",
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });
});
