<?php

/*
 * Database
 * The single connection to the MySQL database, shared by every DAO.
 *
 * Usage inside a DAO:
 *     $this->db = Database::getConnection();
 *
 * Default settings match XAMPP (user root, no password).
 * If your computer is different, create php/dal/config.local.php
 * (not committed to Git) that returns only the values you need to change:
 *     <?php return ['password' => 'root', 'port' => 8889];
 */

class Database
{
    // The one shared connection. null until the first call to getConnection().
    private static ?PDO $connection = null;

    // Default connection settings (XAMPP on Mac and Windows)
    private const DEFAULTS = [
        'host'     => 'localhost',
        'port'     => 3306,
        'dbname'   => 'cms',
        'user'     => 'root',
        'password' => '',
    ];

    // Nobody can write "new Database()": the only way in is getConnection().
    private function __construct()
    {
    }

    // Returns the shared connection, creating it the first time it is asked for.
    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            self::$connection = self::connect();
        }

        return self::$connection;
    }

    // Opens the connection with the settings every DAO relies on.
    private static function connect(): PDO
    {
        $config = self::loadConfig();

        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $config['host'],
            $config['port'],
            $config['dbname']
        );

        $options = [
            // Any SQL error throws an exception instead of failing silently
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            // fetch() and fetchAll() return arrays like ['name' => 'Marta']
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // Real prepared statements: values never become part of the SQL text
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            return new PDO($dsn, $config['user'], $config['password'], $options);
        } catch (PDOException $e) {
            // The real reason goes to the PHP error log; the browser only gets a
            // general message, so passwords and paths are never shown to users.
            error_log('Database connection failed: ' . $e->getMessage());
            throw new RuntimeException('Could not connect to the database.');
        }
    }

    // Merges the defaults with this computer's config.local.php, if it exists.
    private static function loadConfig(): array
    {
        $localFile = __DIR__ . '/config.local.php';

        if (is_file($localFile)) {
            $local = require $localFile;
            if (is_array($local)) {
                return array_merge(self::DEFAULTS, $local);
            }
        }

        return self::DEFAULTS;
    }
}
