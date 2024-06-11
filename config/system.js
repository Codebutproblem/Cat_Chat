const path_admin = "/admin";

const error_page = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 Not Found</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #000;
            color: #fff;
            font-family: Arial, sans-serif;
        }

        .error-container {
            text-align: center;
        }

        h1 {
            font-size: 8em;
            margin: 0;
        }

        p {
            font-size: 1.5em;
        }

        a {
            color: #fff;
            text-decoration: none;
            border: 1px solid #fff;
            padding: 10px 20px;
            border-radius: 5px;
            transition: all 0.3s ease;
        }

        a:hover {
            background-color: #fff;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>404</h1>
        <p>Oops! Trang bạn tìm kiếm không tồn tại.</p>
        <a href="/">Quay lại trang chủ</a>
    </div>
</body>
</html>
`;

module.exports = {
    path_admin: path_admin,
    error_page: error_page
};