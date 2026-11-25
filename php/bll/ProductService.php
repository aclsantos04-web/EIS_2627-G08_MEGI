<?php

/* Responsável pelas validações e regras dos produtos antes de aceder à base de dados.
 *
 * Exemplo:
 * - verifica se o nome foi preenchido;
 * - verifica se o peso e o volume são válidos;
 * - só depois chama o ProductDAO para guardar ou obter dados.
 *
 * Em resumo:
 * ProductService = verifica se os dados fazem sentido.
 * ProductDAO     = executa as operações na base de dados.
 */

require_once __DIR__ . '/../dal/ProductDAO.php';

class ProductService
{
    // Objeto usado para aceder aos dados dos produtos
    private ProductDAO $productDAO;

    // Cria o ProductDAO quando o serviço é iniciado
    public function __construct()
    {
        $this->productDAO = new ProductDAO();
    }

    // Lista todos os produtos de um cliente
    public function getProductsByClient(int $clientId): array
    {
        return $this->productDAO->getByClient($clientId);
    }

    // Procura um produto específico de um cliente
    public function getProductById(int $productId, int $clientId): ?array
    {
        return $this->productDAO->getById($productId, $clientId);
    }

    // Valida os dados e cria um novo produto
    public function createProduct(
        int $clientId,
        int $categoryId,
        string $name,
        string $description,
        float $weightKg,
        float $volumeM3
    ): int {

        // O nome do produto é obrigatório
        if (trim($name) === '') {
            throw new InvalidArgumentException(
                'Product name is required.'
            );
        }

        // O peso tem de ser superior a zero
        if ($weightKg <= 0) {
            throw new InvalidArgumentException(
                'Weight must be greater than zero.'
            );
        }

        // O volume tem de ser superior a zero
        if ($volumeM3 <= 0) {
            throw new InvalidArgumentException(
                'Volume must be greater than zero.'
            );
        }

        // Depois das validações, envia os dados para o DAO
        return $this->productDAO->create(
            $clientId,
            $categoryId,
            trim($name),
            trim($description),
            $weightKg,
            $volumeM3
        );
    }

    // Elimina um produto se pertencer ao cliente
    public function deleteProduct(
        int $productId,
        int $clientId
    ): bool {
        return $this->productDAO->delete(
            $productId,
            $clientId
        );
    }
}
