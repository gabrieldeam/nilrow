package marketplace.nilrow.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

public class CookieUtil {

    public static void addAuthCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("auth_token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // Configure isso como true se estiver usando HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60 * 24); // Expira em 1 dia

        response.addCookie(cookie);
    }
}
