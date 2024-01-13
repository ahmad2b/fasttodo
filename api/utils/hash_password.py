from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class HashPassword:
    def create_pass(self, password: str):
        return pwd_context.hash(password)

    def verify_pass(self, plain_pass: str, hashed_pass: str):
        return pwd_context.verify(plain_pass, hashed_pass)
