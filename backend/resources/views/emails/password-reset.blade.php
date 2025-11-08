<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>Reset your password</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>

<body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7f9;padding:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;"> <!-- Header -->
                    <tr>
                        <td style="padding:18px 24px;background:#135D52;text-align:center;"> <img src="{{ $logoUrl }}" alt="{{ $appName }}" width="160" height="40" style="height:40px;max-height:40px;width:auto;border:0;display:inline-block;"> </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:26px 24px 8px;color:#111827;">
                            <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#111827;">Reset your password</h1>
                            <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6;">
                                Hi {{ $name ?? 'there' }},
                            </p>
                            <p style="margin:0 0 18px;color:#374151;font-size:14px;line-height:1.6;">
                                You recently requested to reset your {{ $appName }} password. Click the button below to set a new password.
                            </p>
                            @if(!empty($expires))
                            <p style="margin:0 0 18px;color:#6b7280;font-size:12px;line-height:1.6;">
                                For security, this link will expire in {{ $expires }} minutes.
                            </p>
                            @endif
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:16px 0 10px;">
                                <tr>
                                    <td>
                                        <a href="{{ $url }}" style="background:#135D52;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:700;font-size:14px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <!-- Fallback link (optional, uncomment if you want it visible) -->
                            <!-- <p style="margin:16px 0 0;color:#6b7280;font-size:12px;line-height:1.6;">
                                If the button doesn't work, copy and paste this link into your browser:
                                <br />
                                <a href="{{ $url }}" style="color:#2ab09c;word-break:break-all;text-decoration:none;">{{ $url }}</a>
                            </p> -->

                            <p style="margin:20px 0 0;color:#6b7280;font-size:12px;line-height:1.6;">
                                If you didn’t request a password reset, no further action is required.
                            </p>
                            <p style="margin:8px 0 0;color:#6b7280;font-size:12px;">Regards,<br>{{ $appName }}</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:18px 24px 20px;background:#ffffff;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" style="padding:10px 0;">
                                        @if(!empty($instagramUrl))
                                        <a href="{{ $instagramUrl }}" target="_blank" rel="noopener" style="text-decoration:none;margin:0 6px;">
                                            <img
                                                src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                                                alt="Instagram"
                                                width="22"
                                                height="22"
                                                style="display:inline-block;height:22px;width:22px;border:0;" />
                                        </a>
                                        @endif
                                        @if(!empty($facebookUrl))
                                        <a href="{{ $facebookUrl }}" target="_blank" rel="noopener" style="text-decoration:none;margin:0 6px;">
                                            <img
                                                src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                                                alt="Facebook"
                                                width="22"
                                                height="22"
                                                style="display:inline-block;height:22px;width:22px;border:0;" />
                                        </a>
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="color:#9ca3af;font-size:12px;">
                                        © {{ date('Y') }} {{ $appName }}. All rights reserved.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <div style="height:12px;line-height:12px;">&nbsp;</div>
            </td>
        </tr>
    </table>
</body>

</html>