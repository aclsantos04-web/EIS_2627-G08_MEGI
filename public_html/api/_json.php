<?php

/*
 * JsonResponse
 * The one way every endpoint in public_html/api/ answers the browser.
 *
 * Every reply has the same shape:
 *     success: { "ok": true,  "data": ... }
 *     failure: { "ok": false, "error": "message for the user" }
 * plus the matching HTTP status code (200, 400, 401, 403, 404, 405, 500).
 *
 * Usage at the top of an endpoint (the file name starts with _ because it
 * is a helper, not an endpoint):
 *     require_once __DIR__ . '/_json.php';
 *     JsonResponse::requireMethod('GET');
 *     JsonResponse::success($products);
 */

// PHP warnings printed in the middle of the reply would break the JSON,
// so they are never shown; they are turned into exceptions instead (below).
ini_set('display_errors', '0');

class JsonResponse
{
    // Sends a successful reply. $status 201 = something was created.
    public static function success($data = null, int $status = 200): void
    {
        self::send(['ok' => true, 'data' => $data], $status);
    }

    // Sends a failure reply with a message the page can show to the user.
    public static function error(string $message, int $status = 400): void
    {
        self::send(['ok' => false, 'error' => $message], $status);
    }

    // Stops the request unless it uses one of the allowed HTTP methods.
    // Example: JsonResponse::requireMethod('POST');
    public static function requireMethod(string ...$allowed): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if (!in_array($method, $allowed, true)) {
            header('Allow: ' . implode(', ', $allowed));
            self::error('Method not allowed.', 405);
        }
    }

    // Returns the data the page sent: a JSON body from fetch(), or a normal form.
    public static function readBody(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (str_contains($contentType, 'application/json')) {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);

            if (!is_array($data)) {
                self::error('The request body is not valid JSON.', 400);
            }
            return $data;
        }

        return $_POST;
    }

    // Last safety net: any error nobody caught becomes a JSON 500 reply.
    // The details go to the PHP error log, never to the browser.
    public static function handleUncaught(Throwable $e): void
    {
        error_log('API error in ' . ($_SERVER['SCRIPT_NAME'] ?? '?') . ': '
            . $e->getMessage() . ' (' . $e->getFile() . ':' . $e->getLine() . ')');
        self::send(['ok' => false, 'error' => 'Something went wrong on the server.'], 500);
    }

    // Writes the status code, the JSON header and the body, then ends the request.
    private static function send(array $payload, int $status): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Warnings and notices become exceptions, so they also reach handleUncaught().
set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

set_exception_handler([JsonResponse::class, 'handleUncaught']);
