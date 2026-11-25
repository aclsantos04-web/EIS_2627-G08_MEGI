<?php

/* API recebe pedidos do frontend e devolve respostas relacionadas com produtos
 *
 * GET    -> lista produtos do cliente
 * POST   -> cria um produto
 * DELETE -> elimina um produto
 */

ssession_start();

header('Content-Type: application/json');

require_once __DIR__ . '/../../php/bll/ProductService.php';

$productService = new ProductService();


/*
 * Verifica se existe um utilizador autenticado.
 * Confirmar o nome da variável de sessão quando o login estiver concluído. falta + verificar role
 */
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'User not authenticated.'
    ]);

    exit;
}

$clientId = (int) $_SESSION['user_id'];


/*
 * Identifica o tipo de pedido recebido:
 * GET, POST ou DELETE.
 */
$method = $_SERVER['REQUEST_METHOD'];


try {

    /*
     * ========================================================
     * GET - LISTAR PRODUTOS
     * ========================================================
     */
    if ($method === 'GET') {

        $products = $productService->getProductsByClient($clientId);

        echo json_encode([
            'success' => true,
            'products' => $products
        ]);

        exit;
    }


    /*
     * ========================================================
     * POST - CRIAR PRODUTO
     * ========================================================
     */
    if ($method === 'POST') {

        // Lê o JSON enviado pelo JavaScript
        $input = json_decode(
            file_get_contents('php://input'),
            true
        );

        /*
         * Se algum campo não vier no pedido, é usado um valor
         * vazio ou zero. O ProductService faz depois a validação.
         */
        $categoryId = isset($input['category_id'])
            ? (int) $input['category_id']
            : 0;

        $name = $input['name'] ?? '';

        $description = $input['description'] ?? '';

        $weightKg = isset($input['weight_kg'])
            ? (float) $input['weight_kg']
            : 0;

        $volumeM3 = isset($input['volume_m3'])
            ? (float) $input['volume_m3']
            : 0;

        $productId = $productService->createProduct(
            $clientId,
            $categoryId,
            $name,
            $description,
            $weightKg,
            $volumeM3
        );

        echo json_encode([
            'success' => true,
            'product_id' => $productId,
            'message' => 'Product created successfully.'
        ]);

        exit;
    }


    /*
     * ========================================================
     * DELETE - ELIMINAR PRODUTO
     * ========================================================
     */
    if ($method === 'DELETE') {

        // Lê o JSON enviado pelo JavaScript
        $input = json_decode(
            file_get_contents('php://input'),
            true
        );

        $productId = isset($input['product_id'])
            ? (int) $input['product_id']
            : 0;

        $deleted = $productService->deleteProduct(
            $productId,
            $clientId
        );

        if (!$deleted) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Product not found.'
            ]);

            exit;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Product deleted successfully.'
        ]);

        exit;
    }


    /*
     * Se receber outro método HTTP, rejeita.
     */
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);

} catch (InvalidArgumentException $e) {

    /*
     * Erros de validação vindos do ProductService.
     */
    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

} catch (Throwable $e) {

    /*
     * Outros erros inesperados.
     */
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Internal server error.'
    ]);
}