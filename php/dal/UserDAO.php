
<?php

/*
 * UserDAO
 * Handles all database operations related to users.
 */

require_once __DIR__ . '/Database.php';

class UserDAO
{
    private PDO $db;

    // Obtains the shared database connection
    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // Finds a user by ID
    public function getById(int $userId): ?array
    {
        $sql = "SELECT * FROM `user` WHERE user_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);

        $user = $stmt->fetch();

        return $user ?: null;
    }

    // Finds a user by username
    public function getByUsername(string $username): ?array
    {
        $sql = "SELECT * FROM `user` WHERE username = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$username]);

        $user = $stmt->fetch();

        return $user ?: null;
    }

    // Finds a user by email
    public function getByEmail(string $email): ?array
    {
        $sql = "SELECT * FROM `user` WHERE email = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$email]);

        $user = $stmt->fetch();

        return $user ?: null;
    }

    // Finds a user by NIF
    public function getByNif(string $nif): ?array
    {
        $sql = "SELECT * FROM `user` WHERE nif = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$nif]);

        $user = $stmt->fetch();

        return $user ?: null;
    }

    // Finds a user by username or email
    public function getByLogin(string $identifier): ?array
    {
        if (str_contains($identifier, '@')) {
            return $this->getByEmail($identifier);
        }

        return $this->getByUsername($identifier);
    }

    // Creates a new user and returns its ID
    public function create(
        string $username,
        string $passwordHash,
        string $email,
        string $name,
        ?string $phone,
        ?string $nif,
        string $role,
        string $accountStatus
    ): int {
        $sql = "
            INSERT INTO `user` (
                username,
                password_hash,
                email,
                name,
                phone,
                nif,
                role,
                account_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            $username,
            $passwordHash,
            $email,
            $name,
            $phone,
            $nif,
            $role,
            $accountStatus
        ]);

        return (int) $this->db->lastInsertId();
    }
}

