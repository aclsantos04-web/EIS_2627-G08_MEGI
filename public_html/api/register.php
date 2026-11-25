
<?php

/*
 * Register API
 * Receives registration requests and returns JSON responses.
 */

require_once __DIR__ . '/../../php/bll/AuthService.php';

header('Content-Type: application/json; charset=utf-8');

// Only POST requests are accepted
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);

    exit;
}

try {

    // Read JSON data sent by the frontend
    $data = json_decode(
        file_get_contents('php://input'),
        true
    );

    // Check if the request contains valid data
    if (!is_array($data) || array_is_list($data)) {
        throw new InvalidArgumentException(
            'Invalid request data.', 400
        );
    }

    // Register the user through the Business Logic Layer
    $authService = new AuthService();
    $user = $authService->register($data);

    // Account successfully created
    http_response_code(201);

    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully.',
        'user' => $user
    ]);

} catch (InvalidArgumentException | DomainException $e) {

    // Validation and business rule errors
    http_response_code($e->getCode() ?: 400);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

} catch (Throwable $e) {

    // Unexpected server errors
    error_log($e->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred.'
    ]);
}

