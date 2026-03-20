export function generateOtp(){
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export function getOtpHtml(otp){
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #333;    
            margin: 20px 0;
        }
        .message {
            font-size: 16px;
            color: #666;
        }   
    </style>
</head>
<body>  
    <div class="container">
        <h2>OTP Verification</h2>
        <p class="message">Your OTP code is:</p>    
        <div class="otp">${otp}</div>
    </div>
</body>
</html>`
}
