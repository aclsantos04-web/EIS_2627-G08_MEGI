
<?php

/*
 * AuthService
 * Handles authentication, registration and user validation.
 */

require_once __DIR__ . '/../dal/UserDAO.php';

class AuthService
{
    private UserDAO $userDAO;

    public function __construct()
    {
        $this->userDAO = new UserDAO();
    }

    // Registers a new user
    public function register(array $data): array
    {
        $name = trim($this->getString($data, 'name'));
        $username = trim($this->getString($data, 'username'));
        $email = trim($this->getString($data, 'email'));
        $phone = trim($this->getString($data, 'phone'));
        $nif = trim($this->getString($data, 'nif'));
        $role = trim($this->getString($data, 'role'));
        $password = $this->getString($data, 'password');

        // Validate full name
        if (mb_strlen($name) < 2 || mb_strlen($name) > 120) {
            throw new InvalidArgumentException(
                'Please enter a valid full name.', 422
            );
        }

        // Validate username
        if ($username === '' || mb_strlen($username) > 50
            || str_contains($username, '@')) {
            throw new InvalidArgumentException(
                'Please enter a valid username.', 422
            );
        }

        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)
            || mb_strlen($email) > 120) {
            throw new InvalidArgumentException(
                'Please enter a valid email address.', 422
            );
        }

        // Validate Portuguese phone number
        if (!preg_match('/^[29][0-9]{8}$/D', $phone)) {
            throw new InvalidArgumentException(
                'Phone must have 9 digits and start with 2 or 9.', 422
            );
        }

        // Validate Portuguese NIF
        if (!$this->isValidNif($nif)) {
            throw new InvalidArgumentException(
                'Please enter a valid Portuguese NIF.', 422
            );
        }

        // Only these roles can register publicly
        if (!in_array($role, ['client', 'courier', 'staff'], true)) {
            throw new InvalidArgumentException(
                'Invalid registration role.', 422
            );
        }

        // Validate password
        if (trim($password) === ''
            || mb_strlen($password) < 8
            || strlen($password) > 72
            || str_contains($password, "\0")) {
            throw new InvalidArgumentException(
                'Password must contain at least 8 characters '
                . 'and no more than 72 bytes.', 422
            );
        }

        // Check duplicated username
        if ($this->userDAO->getByUsername($username) !== null) {
            throw new DomainException(
                'This username is already taken.', 409
            );
        }

        // Check duplicated email
        if ($this->userDAO->getByEmail($email) !== null) {
            throw new DomainException(
                'An account with this email already exists.', 409
            );
        }

        // Check duplicated NIF
        if ($this->userDAO->getByNif($nif) !== null) {
            throw new DomainException(
                'This NIF is already registered.', 409
            );
        }

        // Clients are active immediately.
        // Couriers and staff require approval.
        $accountStatus = $role === 'client'
            ? 'active'
            : 'pending';

        // Securely hash the password
        $passwordHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        // Save user through the Data Access Layer
        try {
            $userId = $this->userDAO->create(
                $username,
                $passwordHash,
                $email,
                $name,
                $phone,
                $nif,
                $role,
                $accountStatus
            );
        } catch (PDOException $e) {
            // Also handles simultaneous duplicate registrations
            if (($e->errorInfo[1] ?? null) === 1062) {
                throw new DomainException(
                    'Username, email or NIF already registered.', 409
                );
            }

            throw $e;
        }

        return [
            'user_id' => $userId,
            'username' => $username,
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'account_status' => $accountStatus
        ];
    }

    // Authenticates a user by username or email
    public function login(
        string $identifier,
        string $password
    ): array {
        $identifier = trim($identifier);

        if ($identifier === '' || $password === '') {
            throw new InvalidArgumentException(
                'Username or email and password are required.', 422
            );
        }

        // Find the account
        $user = $this->userDAO->getByLogin($identifier);

        // Verify credentials
        if ($user === null ||
            !password_verify($password, $user['password_hash'])) {
            throw new DomainException(
                'Invalid username, email or password.', 401
            );
        }

        // Check account approval status
        if ($user['account_status'] === 'pending') {
            throw new DomainException(
                'Your account is waiting for approval.', 403
            );
        }

        if ($user['account_status'] === 'rejected') {
            throw new DomainException(
                'Your account was not approved.', 403
            );
        }

        if ($user['account_status'] !== 'active') {
            throw new DomainException(
                'This account is not active.', 403
            );
        }

        // Return only the information needed by the application
        return [
            'user_id' => (int) $user['user_id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'account_status' => $user['account_status']
        ];
    }

    // Reads a string safely from the registration data
    private function getString(array $data, string $key): string
    {
        $value = $data[$key] ?? '';

        if (!is_string($value)) {
            throw new InvalidArgumentException(
                'Invalid registration data.', 422
            );
        }

        return $value;
    }

    // Validates the Portuguese NIF check digit
    private function isValidNif(string $nif): bool
    {
        if (!preg_match('/^[1-9][0-9]{8}$/D', $nif)) {
            return false;
        }

        $sum = 0;

        for ($i = 0; $i < 8; $i++) {
            $sum += (int) $nif[$i] * (9 - $i);
        }

        $remainder = $sum % 11;

        $checkDigit = $remainder < 2
            ? 0
            : 11 - $remainder;

        return $checkDigit === (int) $nif[8];
    }
}

