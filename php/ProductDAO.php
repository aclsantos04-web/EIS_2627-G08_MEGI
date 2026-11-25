<?php

/*
 * ProductDAO
 * Responsável pelo acesso aos produtos na base de dados.
 */

require_once __DIR__ . '/Database.php';

class ProductDAO
{
    // Ligação à base de dados
    private PDO $db;

    // Obtém a ligação à base de dados quando a classe é criada
    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // Lista todos os produtos de um cliente
    public function getByClient(int $clientId): array
    {
        $sql = "
            SELECT *
            FROM product
            WHERE client_id = ?
            ORDER BY created_at DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$clientId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Procura um produto específico de um cliente
    public function getById(int $productId, int $clientId): ?array
    {
        $sql = "
            SELECT *
            FROM product
            WHERE product_id = ?
              AND client_id = ?
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            $productId,
            $clientId
        ]);

        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        return $product ?: null;
    }

    // Cria um novo produto e devolve o ID criado
    public function create(
        int $clientId,
        int $categoryId,
        string $name,
        string $description,
        float $weightKg,
        float $volumeM3
    ): int {
        $sql = "
            INSERT INTO product (
                client_id,
                category_id,
                name,
                description,
                weight_kg,
                volume_m3
            )
            VALUES (?, ?, ?, ?, ?, ?)
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            $clientId,
            $categoryId,
            $name,
            $description,
            $weightKg,
            $volumeM3
        ]);

        return (int) $this->db->lastInsertId();
    }

    // Elimina um produto se pertencer ao cliente
    public function delete(int $productId, int $clientId): bool
    {
        $sql = "
            DELETE FROM product
            WHERE product_id = ?
              AND client_id = ?
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            $productId,
            $clientId
        ]);

        return $stmt->rowCount() > 0;
    }
}
